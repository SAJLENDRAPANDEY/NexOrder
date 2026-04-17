from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core import schemas, models
from app.services import crud
from app.core.database import get_db
from app.dependencies import get_current_user, razorpay_client
from sqlalchemy.orm import joinedload

router = APIRouter(tags=["Orders"])

ORDER_STATUS_FLOW = {
    "pending": ["completed", "cancelled"],
    "completed": [],
    "cancelled": []
}

@router.post("/")
def create_order(
    order: schemas.OrderCreate,
    use_wallet: bool = False,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_order = models.Order(user_id=current_user.id, status="pending", used_wallet=use_wallet)
    db.add(db_order)
    db.flush()

    total_price = 0

    for item in order.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()

        if not product:
            raise HTTPException(404, "Product not found")

        if product.stock < item.quantity:
            raise HTTPException(400, "Not enough stock")

        subtotal = product.price * item.quantity
        total_price += subtotal

        db.add(models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            price_at_purchase=product.price
        ))

    db_order.total_price = total_price

    # wallet payment path – mark for later deduction, don't change balance or stock yet
    if use_wallet:
        # still validate sufficient funds but don't debit now
        if current_user.balance < total_price:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        # leave order pending; admin approval will debit and deduct stock
        db.commit()
        db.refresh(db_order)

        return {
            "order_id": db_order.id,
            "total": total_price,
            "message": "Order created successfully; pay with wallet when admin approves"
        }

    # non-wallet path: create a Razorpay order as soon as we calculate the total
    db.commit()

    if razorpay_client:
        try:
            rz_order = razorpay_client.order.create({
                "amount": int(total_price * 100),
                "currency": "INR",
                "receipt": f"order_{db_order.id}",
            })
            db_order.razorpay_order_id = rz_order.get("id")
            db.commit()
            db.refresh(db_order)

            return {
                "order_id": db_order.id,
                "total": total_price,
                "razorpay_order": rz_order,
                "message": "Order created successfully, proceed to payment"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Razorpay error: {str(e)}")
    else:
        # Fallback when Razorpay is not configured
        db_order.razorpay_order_id = "test_order"
        db.commit()
        db.refresh(db_order)

        return {
            "order_id": db_order.id,
            "total": total_price,
            "message": "Order created successfully (Razorpay not configured)"
        }

@router.get("/")
def my_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        orders = db.query(models.Order).options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        ).filter(
            models.Order.user_id == current_user.id
        ).all()

        result = []

        for order in orders:
            items_list = []
            for item in order.items:
                items_list.append({
                    "product_name": item.product.name if item.product else "Deleted Product",
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase,
                    "subtotal": item.quantity * item.price_at_purchase
                })

            order_data = {
                "order_id": order.id,
                "total_price": order.total_price,
                "created_at": order.created_at,
                "status": order.status,
                "used_wallet": order.used_wallet,
                "razorpay_order_id": order.razorpay_order_id,
                "payment_status": order.payment_status,
                "items": items_list
            }

            result.append(order_data)

        return result

    except Exception as e:
        print(f"Orders error: {e}")  # Check your terminal for the real error
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/orders")
def admin_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    try:
        orders = db.query(models.Order).options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
            joinedload(models.Order.user)
        ).all()
        result = []

        for order in orders:
            items_list = []
            for item in order.items:
                items_list.append({
                    "product_name": item.product.name if item.product else "Deleted Product",
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase,
                    "subtotal": item.quantity * item.price_at_purchase
                })

            order_data = {
                "order_id": order.id,
                "user_id": order.user_id,
                "username": order.user.username if order.user else "Deleted User",
                "total_price": order.total_price,
                "created_at": order.created_at,
                "status": order.status,
                "used_wallet": order.used_wallet,
                "razorpay_order_id": order.razorpay_order_id,
                "payment_status": order.payment_status,
                "items": items_list
            }

            result.append(order_data)

        return result

    except Exception as e:
        print(f"ADMIN ORDERS ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    new_status: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    current_status = order.status

    if new_status not in ORDER_STATUS_FLOW.get(current_status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change status from {current_status} to {new_status}"
        )

    # confirm order → deduct wallet
    if current_status == "pending" and new_status == "completed":

        order_owner = db.query(models.User).filter(
            models.User.id == order.user_id
        ).first()

        # only deduct from wallet if the order was placed using wallet balance
        if order.used_wallet:
            if order_owner.balance < order.total_price:
                raise HTTPException(status_code=400, detail="Insufficient balance")

            order_owner.balance -= order.total_price
            order.payment_status = "completed"

        # reduce stock for each item since order is now finalized
        for item in order.items:
            product = item.product
            if product:
                product.stock -= item.quantity

    # cancel order → restore stock
    elif current_status == "pending" and new_status == "cancelled":
        for item in order.items:
            product = item.product
            if product:
                product.stock += item.quantity

    order.status = new_status
    db.commit()
    db.refresh(order)

    return {"message": f"Order {order_id} status updated to {new_status}"}


@router.post("/advance")
def create_advance_order(
    order: schemas.OrderCreate,
    order_date: str,
    time_slot: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_order = models.Order(
        user_id=current_user.id,
        status="pending",
        used_wallet=False,
        scheduled_date=order_date,
        time_slot=time_slot
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return {
        "message": "Advance order placed",
        "order_id": db_order.id,
        "date": order_date,
        "slot": time_slot
    }

@router.get("/analytics/peak-hours")
def peak_hours(db: Session = Depends(get_db)):
    from sqlalchemy import func

    result = db.query(
        func.strftime("%H", models.Order.created_at).label("hour"),
        func.count(models.Order.id)
    ).group_by("hour").all()

    return {
        "peak_data": [
            {"hour": r[0], "orders": r[1]} for r in result
        ]
    }

@router.get("/slots")
def get_slots(db: Session = Depends(get_db)):

    slots = [
        "12:40-1:00",
        "1:00-1:20",
        "1:20-1:40",
        "1:40-2:00"
    ]

    result = []

    for slot in slots:
        count = db.query(models.Order).filter(
            models.Order.time_slot == slot
        ).count()

        result.append({
            "slot": slot,
            "orders": count,
            "available": count < 10
        })

    return result

@router.post("/waste")
def add_food_waste(
    food_name: str,
    quantity: int,
    reason: str = "extra",
    db: Session = Depends(get_db)
):
    waste = models.FoodWaste(
        food_name=food_name,
        quantity=quantity,
        reason=reason
    )

    db.add(waste)
    db.commit()

    return {"message": "Food waste recorded"}

@router.get("/analytics/top-products")
def top_products(db: Session = Depends(get_db)):
    from sqlalchemy import func

    result = db.query(
        models.Product.name,
        func.sum(models.OrderItem.quantity).label("total_orders")
    ).join(models.OrderItem).group_by(models.Product.name).order_by(func.sum(models.OrderItem.quantity).desc()).limit(5).all()

    return [
        {"product": r[0], "orders": r[1]} for r in result
    ]

@router.get("/recommendations")
def recommend_products(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy import func

    user_orders = db.query(models.OrderItem.product_id).join(models.Order).filter(
        models.Order.user_id == current_user.id
    ).all()

    product_ids = [p[0] for p in user_orders]

    if not product_ids:
        return {"message": "No recommendations yet"}

    result = db.query(
        models.Product.name,
        func.sum(models.OrderItem.quantity).label("total")
    ).join(models.OrderItem).filter(
        models.Product.id.in_(product_ids)
    ).group_by(models.Product.name).order_by(func.sum(models.OrderItem.quantity).desc()).limit(3).all()

    return [
        {"recommended_product": r[0]} for r in result
    ]
