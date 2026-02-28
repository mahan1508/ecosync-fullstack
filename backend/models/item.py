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
    weight_kg = Column(Float)
    condition_score = Column(Float)
    carbon_offset_kg = Column(Float) 
    latitude = Column(Float)
    longitude = Column(Float)
    
    # --- VISUAL VERIFICATION ---
    image_url = Column(String, nullable=True)
    
    # --- SECURITY & WORKFLOW ---
    # Status: 'pending', 'verified', 'completed'
    status = Column(String, default="pending") 
    otp = Column(String, nullable=True, default="1234")
    
    # --- ADMIN LOGS & TIMESTAMPS ---
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    # NEW: Tracks when the Admin clicked "Verify"
    verified_at = Column(DateTime, nullable=True)
    # NEW: Allows Admin to add a reason or note (optional)
    admin_note = Column(String, nullable=True, default="System Verified")