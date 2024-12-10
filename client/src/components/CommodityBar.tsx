import {Commodity, CommodityQuote} from "@constants/commodities.ts";
import { FetchHistoricalDataReturnType, useFetchHistoricalData } from "@hooks/useFetchHistoricalData.ts";
import {useEffect, useState} from "react";
import axios from "axios";
import {PLUTUS_API_URL, PLUTUS_QUOTE_PATH} from "@constants/api.ts";

interface CommodityBarProps {
    commodity: Commodity;
}

export const CommodityBar = (props: CommodityBarProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<CommodityQuote>();
    const [previousData, setPreviousData] = useState<CommodityQuote>();
    const [error, setError] = useState<Error>();
    const [priceChanged, setPriceChanged] = useState(false);

    const historicalDataReturn1y: FetchHistoricalDataReturnType = useFetchHistoricalData(
        props.commodity,
        "1y",
        "1d"
    );
    const historicalDataReturn1m: FetchHistoricalDataReturnType = useFetchHistoricalData(
        props.commodity,
        "1mo",
        "1d"
    );

    useEffect(() => {
        const fetchQuoteData = async () => {
            try {
                const response = await axios.get(PLUTUS_API_URL + PLUTUS_QUOTE_PATH + props.commodity);
                if (response.status !== 200) {
                    throw new Error(response.statusText);
                }

                const quote = await response.data

                setData(quote as CommodityQuote);

                // JSON fields overlap with CommodityQuote field names so no need for anything extra
                return quote as CommodityQuote;
            } catch (error) {
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchQuoteData();

        const intervalId = setInterval(async () => {
            const updatedData = await fetchQuoteData();
            if (updatedData === null) return;

            // Check if the price has changed
            if (previousData !== null && updatedData?.regularMarketPrice !== previousData?.regularMarketPrice) {
                setPriceChanged(true);
            }

            setPreviousData(updatedData);
        }, 5000)

        // Cleanup on component unmount
        return () => clearInterval(intervalId);

    }, []);

    // Handle resetting animation after price change
    useEffect(() => {
        if (priceChanged) {
            const timeoutId = setTimeout(() => {
                setPriceChanged(false);
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [priceChanged]);

    const calculatePercentChange = (
        currentPrice: number,
        historicalPrice?: number
    ): { percent: string; color: string } => {
        if (historicalPrice === undefined || historicalPrice === 0 || isNaN(historicalPrice)) {
            return { percent: "N/A", color: "text-gray-500" };
        }

        const changePercent = ((currentPrice - historicalPrice) / historicalPrice) * 100;
        const color =
            changePercent > 0
                ? "text-green-500"
                : changePercent < 0
                    ? "text-red-500"
                    : "text-gray-500";

        return { percent: changePercent.toFixed(2), color };
    };

    const monthlyHistoricalPrice = historicalDataReturn1m?.data?.[0]?.open;
    const yearlyHistoricalPrice = historicalDataReturn1y?.data?.[0]?.open;

    // Calculate monthly and yearly percentage changes only if historical data is available.
    const monthlyChange = data && monthlyHistoricalPrice
        ? calculatePercentChange(data.regularMarketPrice, monthlyHistoricalPrice)
        : { percent: "N/A", color: "text-gray-500" };

    const yearlyChange = data && yearlyHistoricalPrice
        ? calculatePercentChange(data.regularMarketPrice, yearlyHistoricalPrice)
        : { percent: "N/A", color: "text-gray-500" };

    const priceAnimationClass = priceChanged ? "animate-pulse" : "";
    return (
        <div className="flex flex-col sm:flex-row w-full space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-full bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-400">
                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="text-xl font-semibold text-gray-800">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                    <div className="flex justify-between items-center text-red-500">
                        <div className="text-lg font-semibold">Error: {error.message}</div>
                    </div>
                )}

                {/* Data */}
                {data && historicalDataReturn1m && historicalDataReturn1y && !isLoading && !error && (
                    <div className="flex flex-col space-y-3">
                        {/* Commodity Name */}
                        <span className="text-xl font-semibold text-gray-800">{data.shortName}</span>

                        {/* Current Price */}
                        <div className="flex items-center space-x-4">
                            <span className={`text-xl text-gray-800 ${priceAnimationClass}`}>
                                ${data.regularMarketPrice.toFixed(2)}
                            </span>
                            <span
                                className={`${
                                    data.regularMarketChangePercent > 0
                                        ? "text-green-500"
                                        : data.regularMarketChangePercent < 0
                                            ? "text-red-500"
                                            : "text-gray-500"
                                } text-sm`}
                            >
                                {data.regularMarketChangePercent.toFixed(2)}%
                            </span>
                        </div>

                        {/* Monthly and Yearly Changes */}
                        <div className="flex items-center space-x-6">
                            {/* Monthly Change */}
                            <div className="flex items-center">
                                <p className="text-gray-600">Monthly Change:</p>
                                <span className={`ml-2 ${monthlyChange.color}`}>
                                    {monthlyChange.percent}%
                                </span>
                            </div>

                            {/* Yearly Change */}
                            <div className="flex items-center">
                                <p className="text-gray-600">Yearly Change:</p>
                                <span className={`ml-2 ${yearlyChange.color}`}>
                                    {yearlyChange.percent}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};