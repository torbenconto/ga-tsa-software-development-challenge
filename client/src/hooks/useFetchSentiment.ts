import {useEffect, useState} from "react";
import axios from "axios";
import {AI_API_URL, AI_PROXY_PATH, AI_SENTIMENT_PATH} from "@constants/api.ts";
import {Sentiment} from "@constants/ai.ts";
import * as cheerio from "cheerio";

export interface FetchSentimentReturnType {
    isLoading: boolean;
    error: Error;
    data: Sentiment;
}

export const useFetchSentiment = (url: string) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<Sentiment>();
    const [error, setError] = useState<Error>();

    useEffect(() => {
        const fetchSentimentData = async () => {
            try {
                const response = await axios.get(AI_API_URL + AI_PROXY_PATH + "/" + url);
                if (response.status !== 200) {
                    throw new Error(response.statusText);
                }

                const $ = cheerio.load(response.data);

                const articleContent = $('article').text()

                const ai_response = await axios.post(AI_API_URL + AI_SENTIMENT_PATH, {
                    text: articleContent,
                });
                if (ai_response.status !== 200) {
                    throw new Error(ai_response.statusText);
                }

                const sentiment = await ai_response.data

                // JSON fields overlap with CommodityQuote field names so no need for anything extra
                setData(sentiment as Sentiment);
            } catch (error) {
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSentimentData();

    }, [url]);

    return { isLoading, error, data: data } as FetchSentimentReturnType;
}