import { RSSItem } from "@rss-parser/rss.ts";
import { useFetchSentiment } from "@hooks/useFetchSentiment.ts";

export interface NewsArticleProps {
    article: RSSItem;
    index: number;
}

export const NewsArticle = (props: NewsArticleProps) => {
    const { isLoading, error, data } = useFetchSentiment(props.article.title);

    // Define sentiment colors for the box background
    const getSentimentColor = (sentiment: string | undefined) => {
        switch (sentiment) {
            case "POSITIVE":
                return "bg-green-100 text-green-800";
            case "NEGATIVE":
                return "bg-red-100 text-red-800";
            case "NEUTRAL":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-200 text-gray-800";
        }
    };

    return (
        <div
            key={props.index}
            className="w-full bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-400"
        >
            {/* Title */}
            <a
                href={props.article.link}
                className="text-xl font-semibold hover:underline text-gray-800 break-words"
            >
                {props.article.title.slice(0, -props.article.sourceName.length - 3)}
            </a>

            {/* Published Date */}
            <span className="text-sm text-gray-600 block mt-1">
                {new Date(props.article.publishedDate).toLocaleString()}
            </span>

            {/* Sentiment Analysis */}
            {isLoading && (
                <p className="text-blue-500 mt-4">Loading sentiment...</p>
            )}

            {error && (
                <p className="text-red-500 mt-4">Error loading sentiment: {error.message}</p>
            )}

            {data && !isLoading && (
                <div
                    className={`rounded-md p-2 mt-4 text-center font-semibold ${getSentimentColor(
                        data.sentiment
                    )}`}
                >
                    Sentiment: {data.sentiment} ({(data.confidence * 100).toFixed(2)}% confident)
                </div>
            )}

            {/* Source */}
            <a
                href={props.article.sourceUrl}
                className="text-md font-semibold mt-4 hover:underline text-blue-500 block"
            >
                {props.article.sourceName}
            </a>
        </div>
    );
};