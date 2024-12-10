import { useState, useEffect } from 'react';
import {PLUTUS_API_URL, PLUTUS_HISTORICAL_PATH} from "@constants/api.ts";
import {Commodity} from "@constants/commodities.ts";
import axios from "axios";

export type HistoricalData = {
    time: number
    open: number
    close: number
    high: number
    low: number
    volume: number
}

// Typing of data returned from useFetchCommodities
export interface FetchHistoricalDataReturnType {
    isLoading: boolean;
    error: Error;
    data: HistoricalData[];
}

// Data hook for fetching of commodity data to be displayed in the market overview
export const useFetchHistoricalData = (commodity: Commodity, range: string, interval: string) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<HistoricalData[]>();
    const [error, setError] = useState<Error>();

    useEffect(() => {
        const fetchHistoricalData = async () => {
            try {
                const response = await axios.get(PLUTUS_API_URL + PLUTUS_HISTORICAL_PATH + commodity + `?range=${range}` + `&interval=${interval}`);
                if (response.status !== 200) {
                    throw new Error(response.statusText);
                }
                const responseData = await response.data;

                const historicalData = responseData.Data.map((dataPoint: any) => {
                    const lowerCasedPoint: any = {};

                    // Convert each key of the dataPoint to lowercase
                    for (const key in dataPoint) {
                        if (Object.prototype.hasOwnProperty.call(dataPoint, key)) {
                            lowerCasedPoint[key.toLowerCase()] = dataPoint[key];
                        }
                    }

                    return lowerCasedPoint;
                });
                setData(historicalData);
            } catch (error) {
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchHistoricalData();
    }, []);

    return { isLoading, error, data: data } as FetchHistoricalDataReturnType;
}

