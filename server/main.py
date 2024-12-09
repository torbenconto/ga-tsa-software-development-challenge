import requests
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn import metrics
import matplotlib.pyplot as plt

from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
app = FastAPI()

sentiment_pipeline = pipeline("sentiment-analysis")

# SentimentRequest type
class SentimentRequest(BaseModel):
    text: str
@app.post("/sentiment")
async def sentiment(req: SentimentRequest):
    sentiment_result = sentiment_pipeline(req.text)
    return {"sentiment": sentiment_result[0]['label'], "confidence": sentiment_result[0]['score']}

class PricePredictionRequest(BaseModel):
    ticker: str
@app.post("/price_prediction")
async def price_prediction(req: PricePredictionRequest):
    URL = f"https://plutus-api-550455289977.us-central1.run.app/historical/{req.ticker}?range=max&interval=1d"
    response = requests.get(URL)['Data']

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
