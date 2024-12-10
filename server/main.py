import requests
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
from googlenewsdecoder import new_decoderv1

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sentiment_pipeline = pipeline("sentiment-analysis")

# SentimentRequest type
class SentimentRequest(BaseModel):
    article_title: str


@app.post("/sentiment")
async def sentiment(req: SentimentRequest):

    sentiment_result = sentiment_pipeline(req.article_title)

    # Return the result
    return {
        "sentiment": sentiment_result[0]["label"],
        "confidence": sentiment_result[0]["score"]
    }


class PricePredictionRequest(BaseModel):
    ticker: str


@app.post("/price_prediction")
async def price_prediction(req: PricePredictionRequest):
    URL = f"https://plutus-api-550455289977.us-central1.run.app/historical/{req.ticker}?range=max&interval=1d"
    response = requests.get(URL)
    if response.status_code == 200:
        data = response.json().get('Data', {})
        # Process data as necessary


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)