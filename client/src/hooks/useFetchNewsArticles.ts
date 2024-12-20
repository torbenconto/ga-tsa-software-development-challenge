import { useState, useEffect } from 'react';
import {PROXIED_GOOGLE_NEWS_RSS_URL} from "@constants/api.ts";
import {RSSItem, RSSParser} from "@rss-parser/rss.ts";

// Typing of data returned from useFetchCommodities
export interface FetchNewsArticlesReturnType {
    isLoading: boolean;
    error: Error;
    data: RSSItem[];
}

// Data hook for fetching of commodity data to be displayed in the market overview
export const useFetchNewsArticles = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<RSSItem[]>();
    const [error, setError] = useState<Error>();

    useEffect(() => {
        const fetchNewsData = async () => {
            try {
                const parser = new RSSParser(PROXIED_GOOGLE_NEWS_RSS_URL);

                const items = await parser.parse();

                const sortedItems = items.sort((a: RSSItem, b: RSSItem) => {
                    const dateA = new Date(a.publishedDate);
                    const dateB = new Date(b.publishedDate);

                    // Sort in descending order to show recent news first
                    return dateB.getTime() - dateA.getTime();
                });

                setData(sortedItems);
            } catch (error) {
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchNewsData();
    }, []);

    return { isLoading, error, data: data } as FetchNewsArticlesReturnType;
}