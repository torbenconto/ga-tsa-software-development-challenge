import {useFetchNewsArticles, FetchNewsArticlesReturnType} from "@hooks/useFetchNewsArticles.ts";
import {NewsArticle} from "@components/NewsArticle.tsx";

export const NewsSection = () => {
    const { error, isLoading, data }: FetchNewsArticlesReturnType = useFetchNewsArticles();

    return (
        <div className="w-1/3 pl-4 m-4 max-h-full overflow-y-auto">
            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center w-full">
                    <p className="text-lg font-medium text-gray-700">Loading...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center justify-center w-full">
                    <p className="text-lg font-medium text-gray-700">{error.message}</p>
                </div>
            )}

            {/* Data */}
            {data && !isLoading && !error && (
                <div className="space-y-4">
                    {data.map((article, index) => (
                        <NewsArticle index={index} article={article}/>
                    ))}
                </div>
            )}
        </div>
    )

}