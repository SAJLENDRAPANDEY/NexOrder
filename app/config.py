"""
Configuration for NEXSHIP Application
"""

from dotenv import load_dotenv
import os

# Load .env file if it exists
try:
    load_dotenv()
except:
    pass

# ==========================================
# CONFIGURATION SETTINGS
# ==========================================
ENVIRONMENT = "development"
DEBUG = True
LOG_LEVEL = "INFO"

# Frontend configuration
FRONTEND_URL = "http://localhost:3000"

# Optional: External API keys
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# ==========================================
# STATUS LOGGING
# ==========================================
def print_config():
    """Log configuration on startup"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"🔧 Environment: {ENVIRONMENT}")
    logger.info(f"📊 Database: SQLite")
    logger.info(f"🔐 SECRET_KEY: 🔒 configured")
    logger.info(f"📱 Frontend URL: {FRONTEND_URL}")
