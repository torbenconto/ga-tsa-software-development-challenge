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

# Caches
sentiment_cache: Dict[str, Dict] = {}  # Cache: {title: {"timestamp": datetime, "result": Dict}}
prediction_cache: Dict[str, Dict] = {}  # Cache: {ticker: {"timestamp": datetime, "predictions": Dict}}
cache_lock = asyncio.Lock()

# Pydantic models
class SentimentRequest(BaseModel):
    article_title: str


class PricePredictionRequest(BaseModel):
    ticker: str


@app.post("/sentiment")
async def sentiment(req: SentimentRequest):
    title = req.article_title

    # Check sentiment cache
    async with cache_lock:
        cached = sentiment_cache.get(title)
        if cached and cached["timestamp"] > datetime.now() - timedelta(minutes=15):  # Cache expires in 15 mins
            return cached["result"]

    # Perform sentiment analysis
    sentiment_result = sentiment_pipeline(title)

    result = {
        "sentiment": sentiment_result[0]["label"],
        "confidence": sentiment_result[0]["score"],
    }

    # Update sentiment cache
    async with cache_lock:
        sentiment_cache[title] = {"timestamp": datetime.now(), "result": result}

    return result


# --- Price Prediction Endpoint ---
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


async def train_and_save_model(ticker: str, df: pd.DataFrame, model_path: str) -> Prophet:
    """Train and save a Prophet model."""
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=False,
        yearly_seasonality=True,
    )
    model.add_seasonality(name="monthly", period=30.5, fourier_order=5)
    await asyncio.to_thread(model.fit, df)

    # Save the model
    async with aiofiles.open(model_path, "w") as file:
        await file.write(model_to_json(model))

    return model


async def generate_predictions(ticker: str, model: Prophet) -> Dict:
    """Generate predictions for the next day, month, and year."""
    historical_df = model.history.copy()
    historical_df["daily_change"] = historical_df["y"].pct_change()
    avg_daily_change = historical_df["daily_change"].mean() * 100

    future_periods = {"day": 1, "month": 30, "year": 365}
    predictions = {}

    for period_name, days in future_periods.items():
        future_df = model.make_future_dataframe(periods=days)
        forecast = model.predict(future_df)
        predicted_price = forecast.iloc[-1]["yhat"]

        current_price = historical_df.iloc[-1]["y"]
        max_expected_change = current_price * (1 + (avg_daily_change / 100) * days)
        min_expected_change = current_price * (1 - (avg_daily_change / 100) * days)
        bounded_prediction = min(max(predicted_price, min_expected_change), max_expected_change)

        predictions[period_name] = round(bounded_prediction, 2)

    return predictions


@app.post("/price_prediction")
async def price_prediction(req: PricePredictionRequest, background_tasks: BackgroundTasks):
    ticker = req.ticker
    model_path = f"./models/{ticker}.json"

    # Ensure the models directory exists
    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    # Check prediction cache
    async with cache_lock:
        cached = prediction_cache.get(ticker)
        if cached and cached["timestamp"] > datetime.now() - timedelta(minutes=30):  # Cache expires in 30 mins
            return {"predictions": cached["predictions"]}

    # Load or train the model
    model = None
    if os.path.exists(model_path):
        async with aiofiles.open(model_path, "r") as file:
            model_json = await file.read()
            model = model_from_json(model_json)
    else:
        df = await fetch_historical_data(ticker)
        model = await train_and_save_model(ticker, df, model_path)

    # Generate predictions
    predictions = await generate_predictions(ticker, model)

    # Update prediction cache
    async with cache_lock:
        prediction_cache[ticker] = {"timestamp": datetime.now(), "predictions": predictions}

    # Add background task to refresh cache
    background_tasks.add_task(refresh_predictions, ticker, model_path)

    return {"predictions": predictions}


async def refresh_predictions(ticker: str, model_path: str):
    """Refresh predictions in the background."""
    try:
        if os.path.exists(model_path):
            async with aiofiles.open(model_path, "r") as file:
                model_json = await file.read()
                model = model_from_json(model_json)
        else:
            df = await fetch_historical_data(ticker)
            model = await train_and_save_model(ticker, df, model_path)

        # Generate new predictions
        predictions = await generate_predictions(ticker, model)

        # Update prediction cache
        async with cache_lock:
            prediction_cache[ticker] = {"timestamp": datetime.now(), "predictions": predictions}

    except Exception as e:
        print(f"Error refreshing predictions for {ticker}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
