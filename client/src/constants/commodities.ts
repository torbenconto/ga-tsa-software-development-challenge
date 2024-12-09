export const enum Commodity {
    Corn = 'ZC=F',
    Soy = "ZS=F",
    Oats = "ZO=F",
    Hogs = "HE=F",
    Cattle = "LE=F",
    Rice = "ZR=F",
    Wheat = "KE=F",
    Cotton = "CT=F",
}

// Used for iteration purposed, particularly mapping over commodities to render overview
export const COMMODITIES: Commodity[] = [
    Commodity.Corn,
    Commodity.Soy,
    Commodity.Oats,
    Commodity.Hogs,
    Commodity.Cattle,
    Commodity.Rice,
    Commodity.Wheat,
    Commodity.Cotton,
];

// Truncated quote data returned from Plutus API specifically for displaying on the primary commodity list
export interface CommodityQuote {
    regularMarketPrice: number;
    regularMarketChangePercent: number
    shortName: string
}