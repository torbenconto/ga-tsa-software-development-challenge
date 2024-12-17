import { useState, useEffect } from 'react';
import {
    AI_API_URL,
    AI_PRICE_PREDICTION_PATH,
} from "@constants/api.ts";
import {Commodity} from "@constants/commodities.ts";
import axios from "axios";

// Typing of data returned from useFetchPricePrediction
export interface FetchPricePredictionReturnType {
    isLoading: boolean;
    error: Error;
    data: Prediction;
}

export interface Prediction {
    predictions: {
        day: number;
        month: number;
        year: number;
    };
}

// Data hook for fetching of commodity data to be displayed in the market overview
export const useFetchPricePrediction = (commodity: Commodity) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<Prediction>();
    const [error, setError] = useState<Error>();

    useEffect(() => {
        const fetchPricePrediction = async () => {
            try {
                const response = await axios.post(AI_API_URL + AI_PRICE_PREDICTION_PATH, {
                    ticker: commodity,
                });
                if (response.status !== 200) {
                    throw new Error(response.statusText);
                }

                const predictions = await response.data

                setData(predictions);


            } catch (error) {
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPricePrediction();

    }, [commodity]);

    return { isLoading, error, data: data } as FetchPricePredictionReturnType;
}