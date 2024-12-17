import asyncio
import os
from datetime import datetime, timedelta
from typing import Dict
import pandas as pd
import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks
from prophet.serialize import model_from_json, model_to_json
from prophet import Prophet
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
import aiofiles

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize sentiment pipeline
sentiment_pipeline = pipeline("sentiment-analysis")

# Pydantic models
class SentimentRequest(BaseModel):
    article_title: str


class PricePredictionRequest(BaseModel):
    ticker: str


@app.post("/sentiment")
async def sentiment(req: SentimentRequest):
    title = req.article_title

    # Perform sentiment analysis
    sentiment_result = sentiment_pipeline(title)

    result = {
        "sentiment": sentiment_result[0]["label"],
        "confidence": sentiment_result[0]["score"],
    }

    return result

@app.post("/price_prediction")
async def price_prediction(req: PricePredictionRequest, background_tasks: BackgroundTasks):
    ticker = req.ticker


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
