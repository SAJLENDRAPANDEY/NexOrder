# """
# ✅ VERCEL DEPLOYMENT HANDLER
# This file exports the Mangum ASGI handler for Vercel serverless functions.
# """

# from app.main import handler

# # Vercel routes all requests through this handler
# __all__ = ["handler"]


from fastapi import FastAPI
from mangum import Mangum

# Import your actual app
from app.main import app

# Create handler for Vercel
handler = Mangum(app)