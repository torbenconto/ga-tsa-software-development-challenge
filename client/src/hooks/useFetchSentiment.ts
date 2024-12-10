import {useEffect, useState} from "react";
import axios from "axios";
import {AI_API_URL, AI_SENTIMENT_PATH} from "@constants/api.ts";
import {Sentiment} from "@constants/ai.ts";

export interface FetchSentimentReturnType {
    isLoading: boolean;
    error: Error;
    data: Sentiment;
}


export const useFetchSentiment = (title: string) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<Sentiment>();
    const [error, setError] = useState<Error>();

    useEffect(() => {
        const fetchSentimentData = async () => {
            try {
                const ai_response = await axios.post(AI_API_URL + AI_SENTIMENT_PATH, {
                    article_title: title,
                });
                if (ai_response.status !== 200) {
                    throw new Error(ai_response.statusText);
                }

                const sentiment = await ai_response.data

                setData(sentiment as Sentiment);
            } catch (error) {
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSentimentData();

    }, [title]);

    return { isLoading, error, data: data } as FetchSentimentReturnType;
}