# utils/fast_api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os

app = FastAPI()

# Allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or your frontend origin: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for input
class JobInput(BaseModel):
    title: str
    description: str

# Load trained model
model_path = os.path.join(os.path.dirname(__file__), "fraud_model.joblib")
model = joblib.load(model_path)

@app.post("/predict")
async def predict(data: JobInput):
    text = data.title + " " + data.description
    pred = model.predict([text])[0]
    return {"isFraud": bool(pred)}
