import { RSSItem } from "@rss-parser/rss.ts";
import { useFetchSentiment } from "@hooks/useFetchSentiment.ts";

export interface NewsArticleProps {
    article: RSSItem;
    index: number;
}

export const NewsArticle = (props: NewsArticleProps) => {
    const { isLoading, error, data } = useFetchSentiment(props.article.title);

    const getSentimentColor = (sentiment: string | undefined) => {
        switch (sentiment) {
            case 'POSITIVE':
                return 'text-green-500';
            case 'NEGATIVE':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div
            key={props.index}
            className="p-4 border flex flex-col border-1 rounded-lg border-gray-200"
        >
            <a href={props.article.link} className="text-lg font-semibold hover:underline text-gray-800">
                {props.article.title.slice(0, -props.article.sourceName.length - 3)}
            </a>
            <span className="text-sm text-gray-700 mt-1">
                {new Date(props.article.publishedDate).toLocaleString()}
            </span>

            {isLoading && (
                <p className="text-blue-500">Loading sentiment...</p>
            )}

            {error && (
                <p className="text-red-500">Error loading sentiment: {error.message}</p>
            )}

            {data && !isLoading && (
                <p className={`font-semibold ${getSentimentColor(data.sentiment)}`}>
                    Sentiment: {data.sentiment} ({(data.confidence * 100).toFixed(2)}% confident)
                </p>
            )}

            <a href={props.article.sourceUrl}
               className="text-md font-semibold mt-1 hover:underline text-blue-500">
                {props.article.sourceName}
            </a>
        </div>
    );
}