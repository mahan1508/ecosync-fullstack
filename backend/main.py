import uvicorn
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import sys
import shutil
import uuid
import datetime

# Add path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import schemas
from models.item import EcoItem 

# Ensure a directory exists for uploaded images
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize the Database
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="EcoSync API v3.6 - Admin Logging Enabled")

# --- CORS FIX ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static directory so images are accessible via URL
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def calculate_carbon_savings(category: str, weight_kg: float):
    factors = {"electronics": 25.0, "plastic": 6.0, "metal": 12.0, "furniture": 1.5}
    factor = factors.get(category.lower(), 2.0)
    return round(weight_kg * factor, 2)

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoSync v3.6 - Admin Logging & Timestamps Active"}

# --- CREATE ROUTE ---
@app.post("/items/", response_model=schemas.ItemResponse)
async def create_item(
    title: str = Form(...),
    description: str = Form("Verified Waste"),
    category: str = Form(...),
    price: float = Form(0.0),
    weight_kg: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    image_url = None
    
    if image:
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        full_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        try:
            with open(full_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            image_url = f"http://127.0.0.1:8000/static/uploads/{unique_filename}"
        except Exception as e:
            print(f"Error saving file: {e}")

    saved_co2 = calculate_carbon_savings(category, weight_kg)
    
    new_item = EcoItem(
        title=title,
        description=description,
        category=category,
        price=price,
        weight_kg=weight_kg,
        carbon_offset_kg=saved_co2,
        image_url=image_url,
        status="pending",
        otp="1234"
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/items/", response_model=List[schemas.ItemResponse])
def list_items(db: Session = Depends(get_db)):
    return db.query(EcoItem).all()

# --- UPDATED: ADMIN APPROVE ROUTE WITH LOGGING ---
@app.patch("/items/{item_id}/approve")
def approve_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(EcoItem).filter(EcoItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update Status
    item.status = "verified"
    
    # Record Timestamp and Admin Note
    item.verified_at = datetime.datetime.now(datetime.timezone.utc)
    item.admin_note = "Verified by Chief Admin"
    
    db.commit()
    db.refresh(item)
    return {
        "message": f"Item {item_id} verified", 
        "status": item.status,
        "verified_at": item.verified_at
    }

@app.patch("/items/{item_id}/complete")
def complete_item(item_id: int, input_otp: str, db: Session = Depends(get_db)):
    item = db.query(EcoItem).filter(EcoItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if input_otp == item.otp:
        item.status = "completed"
        db.commit()
        return {"message": "Pickup Securely Completed", "status": "completed"}
    else:
        raise HTTPException(status_code=400, detail="Invalid Security Code")

@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(EcoItem).filter(EcoItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item.image_url:
        try:
            filename = item.image_url.split("/")[-1]
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")

    db.delete(item)
    db.commit()
    return {"message": f"Item {item_id} removed"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)