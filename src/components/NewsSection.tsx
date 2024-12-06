import {useFetchNewsArticles, FetchNewsArticlesReturnType} from "@hooks/useFetchNewsArticles.ts";

export const NewsSection = () => {
    const { error, isLoading, data }: FetchNewsArticlesReturnType = useFetchNewsArticles();

    return (
        <div className="w-1/3 pl-4 m-4 max-h-screen overflow-y-auto">
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
                        <div
                            key={index}
                            className="p-4 border flex flex-col border-1 rounded-lg border-gray-200"
                        >
                            <a href={article.link} className="text-lg font-semibold hover:underline text-gray-800">
                                {article.title.slice(0, -article.sourceName.length - 3)}
                            </a>
                            <span className="text-sm text-gray-700 mt-1">
                                {new Date(article.publishedDate).toLocaleString()}
                            </span>
                            <a href={article.sourceUrl} className="text-md font-semibold mt-1 hover:underline text-blue-500">{article.sourceName}</a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

}