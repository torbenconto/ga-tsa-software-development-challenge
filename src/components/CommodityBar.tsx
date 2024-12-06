import {Commodity} from "../constants/commodities.ts";
import {FetchCommoditiesReturnType, useFetchCommodity} from "../hooks/useFetchCommodities.tsx";

interface CommodityBarProps {
    commodity: Commodity;
}

export const CommodityBar = (props: CommodityBarProps) => {
    const { data, isLoading, error }: FetchCommoditiesReturnType = useFetchCommodity(props.commodity);

    return (
        <div className="flex flex-col sm:flex-row w-full space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-full bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-400">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="text-xl font-semibold text-gray-800">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="flex justify-between items-center text-red-500">
                        <div className="text-lg font-semibold">Error: {error.message}</div>
                    </div>
                )}

                {/* Data State */}
                {data && !isLoading && !error && (
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="text-xl font-semibold text-gray-800">{data.shortName}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 flex items-center space-x-3">
                            <span className={`text-xl text-gray-800`}>
                                ${data.regularMarketPrice.toFixed(2)}
                            </span>
                            {/* Green colored change percent if > 0 else red */}
                            {/* TODO: Make 0% change be a gray color instead of red */}
                            <span className={`${data.regularMarketChangePercent > 0 ? 'text-green-500' : 'text-red-500'} text-sm`}>
                                {data.regularMarketChangePercent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
