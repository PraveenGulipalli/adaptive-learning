from fastapi import APIRouter
from app.api.api_v1.endpoints import users, items, auth, learning_resources, summary

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(learning_resources.router, prefix="/learning-resources", tags=["learning-resources"])
api_router.include_router(summary.router, prefix="/summary", tags=["text-analysis"])
