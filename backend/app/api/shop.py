"""
FootballRise Do'kon (Shop) API — Mahsulotlar va Buyurtmalar boshqaruvi.
Admin panel uchun to'liq CRUD + status yangilash.
"""
from __future__ import annotations

import os
import json
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text, BigInteger
)
from sqlalchemy.orm import Session, Mapped, mapped_column

from app.core.database import get_db, Base
from app.core.security import get_current_user, RequireRole

router = APIRouter(tags=["Shop"])


# ==============================================================
# MODELLAR (Shop uchun alohida jadvallar)
# ==============================================================

class Product(Base):
    __tablename__ = "shop_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False, default=0)   # UZS
    category: Mapped[str] = mapped_column(String(50), default="equip")       # smart|equip|kit|boots
    badge: Mapped[str | None] = mapped_column(String(30), nullable=True)     # "New", "AI", "Pro"
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=10)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ShopOrder(Base):
    __tablename__ = "shop_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    shipping_city: Mapped[str] = mapped_column(String(100), default="Toshkent")
    shipping_address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(30), default="click")
    items_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array
    total_price: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(30), default="yangi")
    # yangi | tayyorlanmoqda | yetkazilmoqda | yetkazildi | bekor_qilindi
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ShopNotifyRequest(Base):
    """Do'kon xabar berish so'rovlari (telefon raqam bilan)."""
    __tablename__ = "shop_notify_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    product_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ==============================================================
# SCHEMALAR
# ==============================================================

class ProductOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: int
    category: str
    badge: str | None = None
    image_url: str | None = None
    stock: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None
    price: int = Field(ge=0)
    category: str = "equip"
    badge: str | None = None
    image_url: str | None = None
    stock: int = Field(default=10, ge=0)


class OrderItemSchema(BaseModel):
    id: int
    name: str
    price: int
    qty: int
    image_url: str | None = None


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=200)
    customer_phone: str = Field(min_length=7, max_length=30)
    shipping_city: str = "Toshkent"
    shipping_address: str | None = None
    payment_method: str = "click"
    items: list[OrderItemSchema]


class OrderOut(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    shipping_city: str
    shipping_address: str | None = None
    payment_method: str
    items: list[dict]
    total_price: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


class NotifyCreate(BaseModel):
    phone: str = Field(min_length=7, max_length=30)
    product_id: int | None = None


class NotifyOut(BaseModel):
    id: int
    phone: str
    class Config:
        from_attributes = True


# ==============================================================
# DEFAULT MAHSULOTLAR (baza bo'sh bo'lsa)
# ==============================================================

DEFAULT_PRODUCTS = [
    {
        "name": "FootballRise Smart Ball Pro",
        "description": "IoT sensori bilan jihozlangan aqlli to'p. Shot power, Spin, va Ball trajectory real-vaqtda tahlil qilinadi.",
        "price": 890000,
        "category": "smart",
        "badge": "AI",
        "image_url": "/images/shop/smartball.jpg",
        "stock": 15,
    },
    {
        "name": "FRC-7 AI Kamera",
        "description": "240fps gacha yozib, avtomatik highlight video tayyorlaydi. Skautlar diqqatini jalb qiluvchi professional yozib olish.",
        "price": 1490000,
        "category": "smart",
        "badge": "Pro",
        "image_url": "/images/shop/camera.jpg",
        "stock": 8,
    },
    {
        "name": "Elite Futbol To'pi (FIFA Approved)",
        "description": "FIFA Quality Pro sertifikatiga ega, barcha ob-havo sharoitida professional o'yin uchun.",
        "price": 320000,
        "category": "equip",
        "badge": None,
        "image_url": "/images/shop/ball.jpg",
        "stock": 40,
    },
    {
        "name": "FootballRise Trening Formasi",
        "description": "DryFit texnologiyali nafas oladigan trening kiyimi. FootballRise logotipi bilan.",
        "price": 185000,
        "category": "kit",
        "badge": "New",
        "image_url": "/images/shop/kit.jpg",
        "stock": 50,
    },
    {
        "name": "Nike Mercurial Vapor 16 (Futsal)",
        "description": "Yengil va tezkor futsal butsasi. Dar maydonlarda maksimal nazorat uchun.",
        "price": 650000,
        "category": "boots",
        "badge": None,
        "image_url": "/images/shop/boots.jpg",
        "stock": 20,
    },
]


def _seed_products(db: Session) -> None:
    """Jadval bo'sh bo'lsa, default mahsulotlarni qo'shadi."""
    if db.query(Product).count() == 0:
        for p in DEFAULT_PRODUCTS:
            db.add(Product(**p))
        db.commit()


# ==============================================================
# ROUTES — MAHSULOTLAR
# ==============================================================

@router.get("/api/shop/products", response_model=list[ProductOut])
def get_products(category: str | None = None, db: Session = Depends(get_db)):
    """Barcha faol mahsulotlarni qaytaradi (category bo'yicha filtr bilan)."""
    _seed_products(db)
    q = db.query(Product).filter(Product.is_active == True)  # noqa: E712
    if category and category != "all":
        q = q.filter(Product.category == category)
    return q.order_by(Product.id.asc()).all()


@router.post("/api/shop/products", response_model=ProductOut,
             dependencies=[Depends(RequireRole(["admin"]))])
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    p = Product(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.patch("/api/shop/products/{product_id}",
              dependencies=[Depends(RequireRole(["admin"]))])
def update_product(product_id: int, data: dict, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    for k, v in data.items():
        if hasattr(p, k):
            setattr(p, k, v)
    db.commit()
    return {"ok": True}


@router.delete("/api/shop/products/{product_id}",
               dependencies=[Depends(RequireRole(["admin"]))])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    p.is_active = False
    db.commit()
    return {"ok": True}


# ==============================================================
# ROUTES — BUYURTMALAR
# ==============================================================

@router.post("/api/shop/orders", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    """Yangi buyurtma yaratish. Auth shart emas (mehmon ham xarid qila oladi)."""
    total = sum(item.price * item.qty for item in data.items)
    items_json = json.dumps(
        [i.model_dump() for i in data.items], ensure_ascii=False
    )
    order = ShopOrder(
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        shipping_city=data.shipping_city,
        shipping_address=data.shipping_address,
        payment_method=data.payment_method,
        items_json=items_json,
        total_price=total,
        status="yangi",
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Stokni kamaytirish (imkon bo'lsa)
    for item in data.items:
        p = db.query(Product).filter(Product.id == item.id).first()
        if p and p.stock > 0:
            p.stock = max(0, p.stock - item.qty)
    db.commit()

    return _order_to_out(order)


@router.get("/api/shop/orders", response_model=list[OrderOut],
            dependencies=[Depends(RequireRole(["admin"]))])
def list_orders(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(ShopOrder)
    if status:
        q = q.filter(ShopOrder.status == status)
    orders = q.order_by(ShopOrder.id.desc()).all()
    return [_order_to_out(o) for o in orders]


@router.patch("/api/shop/orders/{order_id}/status",
              dependencies=[Depends(RequireRole(["admin"]))])
def update_order_status(order_id: int, data: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(ShopOrder).filter(ShopOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    allowed = {"yangi", "tayyorlanmoqda", "yetkazilmoqda", "yetkazildi", "bekor_qilindi"}
    if data.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Ruxsat etilgan statuslar: {', '.join(allowed)}")
    order.status = data.status
    db.commit()
    return _order_to_out(order)


def _order_to_out(o: ShopOrder) -> dict:
    try:
        items = json.loads(o.items_json)
    except Exception:
        items = []
    return {
        "id": o.id,
        "customer_name": o.customer_name,
        "customer_phone": o.customer_phone,
        "shipping_city": o.shipping_city,
        "shipping_address": o.shipping_address,
        "payment_method": o.payment_method,
        "items": items,
        "total_price": o.total_price,
        "status": o.status,
        "created_at": o.created_at,
    }


# ==============================================================
# ROUTES — SHOP NOTIFY (xabar berish so'rovlari)
# ==============================================================

@router.post("/api/shop/notify")
def shop_notify(data: NotifyCreate, db: Session = Depends(get_db)):
    """Foydalanuvchi telefon raqamini qoldiradi (mahsulot stockga tushganda xabar uchun)."""
    req = ShopNotifyRequest(phone=data.phone, product_id=data.product_id)
    db.add(req)
    db.commit()
    return {"ok": True, "message": "Telefon raqamingiz saqlandi. Mahsulot qo'lga tegishi bilan xabar beramiz!"}


@router.get("/api/admin/shop-notify",
            dependencies=[Depends(RequireRole(["admin"]))])
def admin_shop_notify(db: Session = Depends(get_db)):
    """Admin uchun: xabar kutayotgan telefon raqamlar ro'yxati."""
    rows = db.query(ShopNotifyRequest).order_by(ShopNotifyRequest.id.desc()).limit(100).all()
    items = [{"id": r.id, "phone": r.phone, "product_id": r.product_id} for r in rows]
    return {"count": len(items), "items": items}
