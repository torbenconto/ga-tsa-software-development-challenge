import { Commodity, CommodityQuote } from "@constants/commodities.ts";
import { FetchHistoricalDataReturnType, useFetchHistoricalData } from "@hooks/useFetchHistoricalData.ts";
import { useEffect, useState } from "react";
import axios from "axios";
import { PLUTUS_API_URL, PLUTUS_QUOTE_PATH } from "@constants/api.ts";
import {useFetchPricePrediction} from "@hooks/useFetchPricePrediction.ts";

interface CommodityBarProps {
    commodity: Commodity;
}

export const CommodityBar = (props: CommodityBarProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<CommodityQuote | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const pricePrediction = useFetchPricePrediction(props.commodity);

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
                setError(null); // Reset error state on each fetch attempt
                const response = await axios.get(PLUTUS_API_URL + PLUTUS_QUOTE_PATH + props.commodity);
                if (response.status !== 200) {
                    throw new Error(`Error fetching data: ${response.statusText}`);
                }

                const quote = response.data;
                setData(quote as CommodityQuote);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "An unexpected error occurred");
                setData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuoteData();

        const intervalId = setInterval(async () => {
            if (!error) {
                await fetchQuoteData();
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [props.commodity, error]);

    const calculatePercentChange = (
        currentPrice: number,
        historicalPrice?: number
    ): { percent: string; color: string } => {
        if (!historicalPrice || historicalPrice <= 0 || isNaN(historicalPrice)) {
            return { percent: "N/A", color: "text-gray-500" };
        }

        const changePercent = ((currentPrice - historicalPrice) / historicalPrice) * 100;
        return {
            percent: changePercent.toFixed(2),
            color: changePercent > 0 ? "text-green-500" : changePercent < 0 ? "text-red-500" : "text-gray-500",
        };
    };

    const monthlyHistoricalPrice = historicalDataReturn1m?.data?.[0]?.open;
    const yearlyHistoricalPrice = historicalDataReturn1y?.data?.[0]?.open;

    const monthlyChange = data && monthlyHistoricalPrice
        ? calculatePercentChange(data.regularMarketPrice, monthlyHistoricalPrice)
        : { percent: "N/A", color: "text-gray-500" };

    const yearlyChange = data && yearlyHistoricalPrice
        ? calculatePercentChange(data.regularMarketPrice, yearlyHistoricalPrice)
        : { percent: "N/A", color: "text-gray-500" };

    return (
        <div
            className={`w-full bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-400 flex flex-col justify-between ${isDropdownOpen ? 'space-y-4' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
            <div className="flex w-full">
                {/* Handle Loading State */}
                {isLoading && !error && (
                    <div className="flex justify-center items-center w-full py-4">
                        <p className="text-gray-500 text-md italic">Loading data...</p>
                    </div>
                )}

                {/* Handle Error State */}
                {error && (
                    <div className="flex flex-col items-center w-full py-4 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-red-500 text-sm font-medium">Error: {error}</p>
                        <p className="text-gray-500 text-xs italic">Please try again later.</p>
                    </div>
                )}

                {/* Render Data */}
                {data && !error && !isLoading && (
                    <>
                        <div className="flex flex-col space-y-3">
                            {/* Commodity Name */}
                            <span className="text-xl font-semibold text-gray-800">{data?.shortName || "N/A"}</span>

                            {/* Current Price */}
                            <div className="flex items-center space-x-4">
                                <span className="text-xl text-gray-800">${data?.regularMarketPrice.toFixed(2)}</span>
                                <span
                                    className={`${
                                        (data?.regularMarketChangePercent || 0) > 0
                                            ? "text-green-500"
                                            : (data?.regularMarketChangePercent || 0) < 0
                                                ? "text-red-500"
                                                : "text-gray-500"
                                    } text-sm`}
                                >
                    {data?.regularMarketChangePercent.toFixed(2)}%
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

                        {/* Prediction Box */}
                            <div
                                className="flex flex-col mx-auto items-center justify-center mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-semibold text-blue-800">Price Prediction</p>
                                {pricePrediction.data && !pricePrediction.isLoading && !pricePrediction.error && (

                                    <span
                                        className="text-xl font-bold text-blue-600">${pricePrediction.data.predictions.day}</span>
                                )}

                                {pricePrediction.error && (
                                    <span className="text-xl font-bold text-blue-600">
                                        N/A
                                    </span>
                                )}

                                {pricePrediction.isLoading && (
                                    <span className="text-xl font-bold text-blue-600">
                                        Loading...
                                    </span>
                                )}


                            </div>


                        {/* Day Range */}
                        <div className="flex flex-col items-center space-y-1 justify-center ml-auto">
                            <p className="text-sm text-gray-500">Day Range</p>
                            <span className="text-gray-800 text-sm font-medium">
                {data.regularMarketDayRange
                    ?.split("-")
                    .map((range) => `$${range.trim()}`)
                    .join(" - ")}
            </span>
                        </div>
                    </>
                )}

            </div>
            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="w-full p-4 bg-gray-100 rounded-lg border border-gray-300">
                </div>
            )}
        </div>
    );
};