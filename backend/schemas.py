from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ItemBase(BaseModel):
    title: str
    description: Optional[str] = "Verified Waste"
    category: str
    price: float = 0.0
    weight_kg: float
    image_url: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    status: str
    otp: Optional[str]
    created_at: datetime
    # --- NEW FIELDS FOR ADMIN LOGS ---
    verified_at: Optional[datetime] = None
    admin_note: Optional[str] = None

    class Config:
        from_attributes = True