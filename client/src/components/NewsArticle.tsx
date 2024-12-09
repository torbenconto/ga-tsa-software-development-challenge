import {RSSItem} from "@rss-parser/rss.ts";
// import {useFetchSentiment} from "@hooks/useFetchSentiment.ts";
// import {AI_API_URL, AI_PROXY_PATH} from "@constants/api.ts";

export interface NewsArticleProps {
    article: RSSItem;
    index: number;
}

export const NewsArticle = (props: NewsArticleProps) => {
    //const {isLoading, error, data} = useFetchSentiment(props.article.link)
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
            <a href={props.article.sourceUrl}
               className="text-md font-semibold mt-1 hover:underline text-blue-500">{props.article.sourceName}</a>
        </div>
    )
}