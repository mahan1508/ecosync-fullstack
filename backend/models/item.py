from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base  
import datetime

class EcoItem(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    category = Column(String)
    price = Column(Float)
    weight_kg = Column(Float) # <--- ADDED THIS LINE
    condition_score = Column(Float)
    carbon_offset_kg = Column(Float) 
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))