import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, RequireRole
from app.models import Product, ShopOrder, User
from app.schemas import (
    ProductCreate, ProductOut, ShopOrderCreate, ShopOrderOut
)

router = APIRouter(tags=["Shop and Orders"])

# --- PRODUCT & SHOP ORDER ENDPOINTS ---
from app.schemas import (
    ProductCreate, ProductOut,
    ShopOrderCreate, ShopOrderOut
)
from app.models import Product, ShopOrder

DEFAULT_PRODUCTS = [
    {
        "name": "FootballRise Cam Pro 4K (AI Tracking)",
        "description": "Libosga oson qistiriladigan magnitli 4K 60FPS POV kamera. Maydondagi o'yiningizni avtomatik qayd etib, FootballRise profiliga sinxronlashtiradi.",
        "category": "smart",
        "price": 3450000,
        "image_url": "/images/camera.jpg",
        "badge": "AI Powered",
        "stock": 8
    },
    {
        "name": "GPS Pro Performance Vest (Aqlli Nimcha)",
        "description": "Professional FIFA standartidagi GPS tahlil nimchasi. Maksimal tezlik (km/soat), sprintlar soni, bosib o'tilgan masofa va Heatmap xaritasini chizib beradi.",
        "category": "smart",
        "price": 1890000,
        "image_url": "/images/general/general_1614632537423-1e6c2e.jpg",
        "badge": "Bestseller",
        "stock": 14
    },
    {
        "name": "FootballRise Official Match Ball Pro",
        "description": "Termik choksiz (thermal bonded) texnologiyaga ega rasmiy FIFA Quality Pro to'pi. Aerodinamik mikro-tekstura va barqaror trayektoriya.",
        "category": "equip",
        "price": 790000,
        "image_url": "/images/general/general_1518609878373-06d740.jpg",
        "badge": "FIFA Quality",
        "stock": 25
    },
    {
        "name": "Carbon Shield Pro (Uglerod Qalqonlar)",
        "description": "100% haqiqiy uglerod tolasi (Carbon Fiber). Og'irligi bor-yo'g'i 38 gramm, boldir suyaklarini qattiq zarbalardan shikastlanishsiz asraydi.",
        "category": "equip",
        "price": 340000,
        "image_url": "/images/players/players_1517466787929-bc9095.jpg",
        "badge": "Ultra Yengil",
        "stock": 30
    },
    {
        "name": "Vortex Speed Elite Butsalari (FG/AG)",
        "description": "Tezlikka yo'naltirilgan uglerod taglikli eng so'nggi avlod butsalari. Sun'iy va tabiiy chim uchun moslashuvchan tikanlar.",
        "category": "boots",
        "price": 1450000,
        "image_url": "/images/players/players_1552374196-1ab2a1c59.jpg",
        "badge": "Yangi",
        "stock": 12
    },
    {
        "name": "FootballRise Pro Kompressiya Libosi",
        "description": "Mushaklar charchoqini kamaytiruvchi, qon aylanishini tezlashtiruvchi va namlikni tez chiqaruvchi nafas oluvchi termal forma to'plami.",
        "category": "kit",
        "price": 580000,
        "image_url": "/images/players/players_1506794778202-cad84c.jpg",
        "badge": "Termo-Active",
        "stock": 20
    },
    {
        "name": "Apex Grip Goalkeeper Pro Gloves",
        "description": "4mm nemis Contact lateksi bilan jihozlangan elit darvozabon qo'lqoplari. Har qanday ob-havoda to'pni ishonchli ushlab qoladi.",
        "category": "equip",
        "price": 690000,
        "image_url": "/images/players/players_1579952363873-27f3ba.jpg",
        "badge": "Grip 4mm",
        "stock": 10
    },
    {
        "name": "Smart Agility Lights & Sensor Kit",
        "description": "Reaksiya, tezkor fikrlash va chaqqonlikni oshiruvchi 6 ta Bluetooth sensorli chiroqlar to'plami. Murabbiylar va o'yinchilar uchun ideal.",
        "category": "smart",
        "price": 1120000,
        "image_url": "/images/stadiums/stadiums_1518091043644-c1d445.jpg",
        "badge": "Mashg'ulot",
        "stock": 7
    }
]

def seed_products_if_empty(db: Session):
    if db.query(Product).count() == 0:
        for p in DEFAULT_PRODUCTS:
            db.add(Product(**p))
        db.commit()

@router.post("/products", response_model=ProductOut, dependencies=[Depends(RequireRole(["admin"]))])
@router.post("/api/shop/products", response_model=ProductOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/products", response_model=list[ProductOut])
@router.get("/api/products", response_model=list[ProductOut])
@router.get("/api/shop/products", response_model=list[ProductOut])
def get_products(category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category and category != "all":
        query = query.filter(Product.category == category)
    return query.all()

@router.post("/api/shop/orders", response_model=ShopOrderOut)
def create_shop_order(order_data: ShopOrderCreate, db: Session = Depends(get_db)):
    order = ShopOrder(**order_data.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.get("/api/shop/orders", response_model=list[ShopOrderOut], dependencies=[Depends(RequireRole(["admin"]))])
def get_shop_orders(db: Session = Depends(get_db)):
    return db.query(ShopOrder).order_by(ShopOrder.created_at.desc()).all()

@router.patch("/api/shop/orders/{order_id}/status", response_model=ShopOrderOut, dependencies=[Depends(RequireRole(["admin"]))])
def update_shop_order_status(order_id: int, status_data: dict, db: Session = Depends(get_db)):
    order = db.query(ShopOrder).filter(ShopOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    new_status = status_data.get("status")
    if new_status:
        order.status = new_status
        db.commit()
        db.refresh(order)
    return order


from pydantic import BaseModel

class ShopNotifyRequest(BaseModel):
    phone: str

@router.post("/api/shop/notify")
def subscribe_shop_notification(req: ShopNotifyRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Telefon raqami kiritilishi shart")
    from app.models.models import ShopNotification
    record = ShopNotification(phone_number=phone)
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"message": "Raqamingiz muvaffaqiyatli saqlandi!", "id": record.id}
