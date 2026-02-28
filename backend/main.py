import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import sys

# Add path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import schemas
from models.item import EcoItem 

# Initialize the Database
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="EcoSync API")

# Unlock the connection for the Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def calculate_carbon_savings(category: str, weight_kg: float):
    factors = {"electronics": 25.0, "furniture": 1.5, "clothing": 15.0, "tools": 4.0}
    factor = factors.get(category.lower(), 2.0)
    return round(weight_kg * factor, 2)

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoSync"}

@app.post("/items/", response_model=schemas.ItemResponse)
def create_item(item_data: schemas.ItemBase, db: Session = Depends(get_db)):
    saved_co2 = calculate_carbon_savings(item_data.category, item_data.weight_kg)
    
    new_item = EcoItem(
        title=item_data.title,
        description=item_data.description,
        category=item_data.category,
        price=item_data.price,
        weight_kg=item_data.weight_kg,
        carbon_offset_kg=saved_co2,
        condition_score=0.9,
        latitude=0.0,
        longitude=0.0
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/items/", response_model=List[schemas.ItemResponse])
def list_items(db: Session = Depends(get_db)):
    return db.query(EcoItem).all()

if __name__ == "__main__":
    # Using 'main:app' as a string ensures 'reload=True' works correctly
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)