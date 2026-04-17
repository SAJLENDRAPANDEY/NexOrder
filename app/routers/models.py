from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

from app.core import models, schemas
from app.core.database import get_db

router = APIRouter()


@router.post("/bulk")
def add_multiple_products(
    products: List[schemas.ProductCreate],
    db: Session = Depends(get_db)
):
    created_products = []

    for product in products:
        db_product = models.Product(**product.dict())
        db.add(db_product)
        created_products.append(db_product)

    db.commit()

    # optional but better
    for product in created_products:
        db.refresh(product)

    return {
        "message": "Products added successfully",
        "count": len(created_products)
    }