"""
✅ VERCEL DEPLOYMENT HANDLER
This file exports the Mangum ASGI handler for Vercel serverless functions.
"""

from app.main import handler

# Vercel routes all requests through this handler
__all__ = ["handler"]
