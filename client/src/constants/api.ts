
// Base URL for the Plutus API
export const PLUTUS_API_URL = "https://plutus-api-550455289977.us-central1.run.app"

// These paths are absolute and thus contain an ending slash so simply concatenating them with the base url and param is possible
export const PLUTUS_QUOTE_PATH = "/quote/"
export const PLUTUS_HISTORICAL_PATH = "/historical/"


const GOOGLE_NEWS_QUERY = "agriculture"
// Base URL for Google News RSS feed
export const GOOGLE_NEWS_RSS_URL = `https://news.google.com/rss/search?q=${GOOGLE_NEWS_QUERY}&hl=en-US&gl=US&ceid=US:en`

// Local proxied url to make cors-free requests to the GOOGLE_NEWS_RSS_URL. Defined in vite.config.ts
export const PROXIED_GOOGLE_NEWS_RSS_URL = "/rss"

export const AI_API_URL = "http://127.0.0.1:8000"

export const AI_SENTIMENT_PATH = "/sentiment"
export const AI_PROXY_PATH = "/proxy"