import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from mangum import Mangum

from contextlib import asynccontextmanager

from app.core.database import engine
from app.core import models
from app.routers import auth, products, orders, payments
from app import config  # 🆕 Import config for environment variables

# ==========================================
# LOGGING SETUP FOR DEBUGGING
# ==========================================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==========================================
# LIFESPAN (DB INIT)
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Print configuration on startup
        config.print_config()
        
        models.Base.metadata.create_all(bind=engine)
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database error: {e}")
    yield


# ==========================================
# APP INIT
# ==========================================
app = FastAPI(
    title="Nexship API",
    description="Food Waste Management + Order System",
    version="2.1.0",
    lifespan=lifespan
)

logger.info("🚀 FastAPI app initialized")


# ==========================================
# FRONTEND STATIC SERVE
# ==========================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

if os.path.exists(FRONTEND_DIR):
    logger.info(f"✅ Frontend found at: {FRONTEND_DIR}")
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        @app.get("/", tags=["Frontend"])
        def serve_index():
            logger.info("📄 Serving index.html")
            return FileResponse(index_file)
    else:
        logger.warning("⚠️ index.html not found")
else:
    logger.warning("⚠️ frontend folder not found")


# ==========================================
# CORS CONFIG - LOCAL DEVELOPMENT
# ==========================================
cors_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"✅ CORS configured for {len(cors_origins)} origins")


# ==========================================
# API ROUTERS
# ==========================================
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

logger.info("✅ All routers registered")


# ==========================================
# HEALTH CHECK ENDPOINTS
# ==========================================
@app.get("/health", tags=["Health"])
def health_check():
    logger.info("🏥 Health check endpoint called")
    return {
        "status": "healthy",
        "message": "API is running",
        "version": "2.1.0"
    }


@app.get("/api/health", tags=["Health"])
def api_health_check():
    logger.info("🏥 API health check called")
    return {"status": "ok", "api": "running"}


# ==========================================
# VERCEL HANDLER - CRITICAL FOR DEPLOYMENT
# ==========================================
handler = Mangum(app)
logger.info("✅ Mangum handler exported for Vercel serverless")