import { parseStringPromise } from 'xml2js';
import axios from "axios";

export interface RSSItem {
    title: string;
    link: string;
    description: string;
    publishedDate: string;
}

export class RSSParser {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    public async parse(): Promise<RSSItem[]> {
        try {
            const response = await axios.get(this.url);
            if (response.status !== 200) {
                throw new Error(response.statusText);
            }

            // Parse xml into JSON fields
            const xml = await parseStringPromise(response.data);

            return xml.rss.channel[0].item.map((item: any) => ({
                title: item.title[0],
                link: item.link[0],
                description: item.description[0],
                publishedDate: item.pubDate[0],
            } as RSSItem));
        } catch (error) {
            throw error as Error;
        }
    }
}