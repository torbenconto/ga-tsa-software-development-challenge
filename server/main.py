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

async def fetch_historical_data(ticker: str) -> pd.DataFrame:
    """Fetch historical data for the given ticker."""
    url = f"https://plutus-api-550455289977.us-central1.run.app/historical/{ticker}?range=10y&interval=1d"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch historical data.")

    data = response.json().get("Data", [])
    if not data:
        raise HTTPException(status_code=404, detail="No historical data found for the ticker.")

    # Prepare data for Prophet
    df = pd.DataFrame(data)
    df = df[["Time", "Close"]].dropna()
    df["Time"] = pd.to_datetime(df["Time"], unit="s").dt.strftime("%Y-%m-%d")
    df.columns = ["ds", "y"]
    return df

@app.post("/price_prediction")
async def price_prediction(req: PricePredictionRequest, background_tasks: BackgroundTasks):
    ticker = req.ticker
    model_path=f'dot/models/{ticker}.json'

    model=None

    if os.path.exists(model_path):
        async with aiofiles.open(model_path, 'r') as file:
            model=model_from_json(file.read())
    else:
        df = await fetch_historical_data(ticker)
        model=Prophet(
            daily_seasonality=False,
            weekly_seasonality=False,
            yearly_seasonality=True
        )
        model.add_seasonality(name="monthly", period=30.5, fourier_order=5)
        model.fit(df)
        async with aiofiles.open(model_path, 'w') as file:
            await file.write(model_to_json(model))

    future_df = model.make_future_dataframe(periods=365)
    forecast=model.predict(future_df)
    return forecast
    


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
