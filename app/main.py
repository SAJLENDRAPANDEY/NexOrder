import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from mangum import Mangum

from contextlib import asynccontextmanager

from app.core.database import engine
from app.core import models
from app.routers import auth, products, orders, payments


# ===============================
# LIFESPAN (DB INIT)
# ===============================
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Database initialized")
    except Exception as e:
        print("DB error:", e)
    yield


# ===============================
# APP INIT
# ===============================
app = FastAPI(
    title="Product Management API",
    description="Product + Order + Payment System",
    version="1.0.0",
    lifespan=lifespan
)


# ===============================
# FRONTEND STATIC SERVE
# ===============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

if os.path.exists(FRONTEND_DIR):
    print(f"Frontend found at: {FRONTEND_DIR}")

    # mount static files
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    index_file = os.path.join(FRONTEND_DIR, "index.html")

    if os.path.exists(index_file):
        @app.get("/", tags=["Frontend"])
        def serve_index():
            return FileResponse(index_file)
    else:
        print("index.html not found inside frontend folder")

else:
    print("frontend folder not found")


# ===============================
# CORS CONFIG
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nexshipp.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===============================
# ROUTERS (IMPORTANT FIX)
# ===============================
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])


# ===============================
# VERCEL HANDLER
# ===============================
@app.get("/test")
def test():
    return {"message": "API working"}