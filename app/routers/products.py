from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc

from app.core import schemas, models
from app.services import crud
from app.core.database import get_db
from app.dependencies import get_current_user

router = APIRouter(
    tags=["Products"]
)


@router.post("/", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return crud.create_product(db=db, product=product)


# 🔥 UPDATED SEARCH + FILTER + SORT API
@router.get("/", response_model=List[schemas.ProductResponse])
def read_products(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).filter(models.Product.is_available == True)

    # 🔍 Search by name
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))

    # 💰 Price filter
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)

    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)

    # 🔃 Sorting
    if sort == "asc":
        query = query.order_by(asc(models.Product.price))
    elif sort == "desc":
        query = query.order_by(desc(models.Product.price))

    return query.offset(skip).limit(limit).all()

@router.get("/low-stock")
def low_stock_products(db: Session = Depends(get_db)):
    LOW_STOCK_LIMIT = 10

    products = db.query(models.Product).filter(
        models.Product.stock <= LOW_STOCK_LIMIT,
        models.Product.is_available == True
    ).all()

    return [
        {
            "name": p.name,
            "stock": p.stock,
            "status": "LOW STOCK ⚠️"
        }
        for p in products
    ]




@router.get("/{product_id}", response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@router.put("/{product_id}")
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return crud.update_product(db, product_id, product)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return crud.delete_product(db, product_id)

