from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# This is what we send TO the server
class ItemBase(BaseModel):
    title: str
    description: str
    category: str
    price: float
    weight_kg: float

# This is what we send BACK to the user (the "Response")
class ItemResponse(ItemBase):
    id: int
    carbon_offset_kg: float
    created_at: datetime

    class Config:
        from_attributes = True