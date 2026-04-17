import razorpay
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core import models, schemas
from app.core.database import get_db
from app.dependencies import razorpay_client, get_current_user
from typing import Optional
from datetime import datetime

router = APIRouter(tags=["Payments"])

@router.post("/wallet/topup")
def initiate_wallet_topup(
    request: schemas.WalletTopUpRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay is not configured")

    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    # 1. Create WalletTransaction record
    tx = models.WalletTransaction(
        user_id=current_user.id,
        amount=request.amount,
        status="pending"
    )
    db.add(tx)
    db.flush()

    # 2. Create Razorpay order
    amount_paise = int(request.amount * 100)
    try:
        rz_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"wallet_topup_{tx.id}",
        })
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Razorpay error: {str(e)}")

    # 3. Store Razorpay order ID
    tx.razorpay_order_id = rz_order.get("id")
    db.commit()
    db.refresh(tx)

    return {
        "transaction_id": tx.id,
        "razorpay_order": rz_order,
        "message": "Wallet top-up initiated"
    }

@router.post("/verify")
def verify_payment(
    request: schemas.PaymentVerifyRequest,
    db: Session = Depends(get_db),
):
    params_dict = {
        "razorpay_order_id": request.razorpay_order_id,
        "razorpay_payment_id": request.razorpay_payment_id,
        "razorpay_signature": request.razorpay_signature,
    }

    try:
        if razorpay_client:
            razorpay_client.utility.verify_payment_signature(params_dict)
        else:
            raise HTTPException(status_code=500, detail="Razorpay is not configured")
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Check if this is a product order
    order = db.query(models.Order).filter(
        models.Order.razorpay_order_id == request.razorpay_order_id
    ).first()

    if order:
        # 🔥 DATE VALIDATION
        if request.scheduled_date:
            selected_date = datetime.strptime(request.scheduled_date, "%Y-%m-%d").date()

            if selected_date < datetime.today().date():
                raise HTTPException(status_code=400, detail="Past date not allowed")

        # 🔥 SLOT LIMIT CHECK
        if request.time_slot:
            count = db.query(models.Order).filter(
                models.Order.scheduled_date == request.scheduled_date,
                models.Order.time_slot == request.time_slot
            ).count()

            if count >= 10:
                raise HTTPException(status_code=400, detail="Slot full")

        # 🔥 SAVE PAYMENT + SLOT DATA
        order.razorpay_payment_id = request.razorpay_payment_id
        order.payment_status = "completed"

        # 🔥 ADD THESE 2 LINES (MOST IMPORTANT)
        order.scheduled_date = request.scheduled_date
        order.time_slot = request.time_slot

        db.commit()

        return {
            "message": "Order payment verified and completed",
            "scheduled_date": order.scheduled_date,
            "time_slot": order.time_slot
        }

    # Check if this is a wallet top-up
    tx = db.query(models.WalletTransaction).filter(
        models.WalletTransaction.razorpay_order_id == request.razorpay_order_id
    ).first()

    if tx:
        if tx.status == "completed":
            return {"message": "Wallet already topped up"}
            
        tx.razorpay_payment_id = request.razorpay_payment_id
        tx.status = "completed"
        
        # Credit user's wallet
        user = db.query(models.User).filter(models.User.id == tx.user_id).first()
        if user:
            user.balance += tx.amount
        
        db.commit()
        return {"message": "Wallet topped up successfully", "new_balance": user.balance}

    raise HTTPException(status_code=404, detail="Transaction or Order not found")

