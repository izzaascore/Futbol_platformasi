from fastapi import APIRouter

from .auth import router as auth_router
from .players import router as players_router
from .matches import router as matches_router
from .tournaments import router as tournaments_router
from .scouts import router as scouts_router
from .shop import router as shop_router
from .community import router as community_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(players_router)
api_router.include_router(matches_router)
api_router.include_router(tournaments_router)
api_router.include_router(scouts_router)
api_router.include_router(shop_router)
api_router.include_router(community_router)

__all__ = [
    "api_router",
    "auth_router",
    "players_router",
    "matches_router",
    "tournaments_router",
    "scouts_router",
    "shop_router",
    "community_router",
]
