import { useState, useEffect } from 'react';
import {CommodityQuote} from "@constants/commodities.ts";
import {PLUTUS_API_URL, PLUTUS_QUOTE_PATH} from "@constants/api.ts";
import {Commodity} from "@constants/commodities.ts";
import axios from "axios";

// Typing of data returned from useFetchCommodities
export interface FetchCommoditiesReturnType {
    isLoading: boolean;
    error: Error;
    data: CommodityQuote;
}

// Data hook for fetching of commodity data to be displayed in the market overview
export const useFetchCommodity = (commodity: Commodity) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<CommodityQuote>();
    const [error, setError] = useState<Error>();

    useEffect(() => {
        const fetchQuoteData = async () => {
            try {
                const response = await axios.get(PLUTUS_API_URL + PLUTUS_QUOTE_PATH + commodity);
                if (response.status !== 200) {
                    throw new Error(response.statusText);
                }

                const quote = await response.data

                // JSON fields overlap with CommodityQuote field names so no need for anything extra
                setData(quote as CommodityQuote);
            } catch (error) {
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchQuoteData();

    }, [commodity]);

    return { isLoading, error, data: data } as FetchCommoditiesReturnType;
}