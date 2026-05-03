// netlify/functions/stock-prices.js
// Deploy this to Netlify Functions for live price updates

const axios = require('axios');

exports.handler = async (event) => {
    const tickers = [
        'NVDA', 'AMD', 'INTC', 'QCOM', 'BROADCOM', 'MRVL', 'LSCC',
        'MSFT', 'AMZN', 'GOOGL', 'META', 'CRM', 'ORCL', 'PAYX',
        'CSCO', 'JNPR', 'ANET', 'COMM', 'VIAVI',
        'SNOW', 'SPLK', 'ADBE', 'DDOG', 'SNPS', 'PSTG'
    ];

    try {
        // Option 1: Use Alpha Vantage API (free tier)
        // https://www.alphavantage.co/
        const apiKey = process.env.ALPHA_VANTAGE_KEY;
        
        // Option 2: Use Finnhub API (recommended, better rate limits)
        // https://finnhub.io/
        const finnhubKey = process.env.FINNHUB_KEY;
        
        // Option 3: Use Polygon.io API
        // https://polygon.io/
        const polygonKey = process.env.POLYGON_KEY;

        // Example using Finnhub (most reliable for real-time data)
        const priceData = {};

        for (const ticker of tickers) {
            try {
                const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
                    params: {
                        symbol: ticker,
                        token: finnhubKey
                    }
                });

                const data = response.data;
                priceData[ticker] = {
                    price: data.c || 0,
                    high: data.h || 0,
                    low: data.l || 0,
                    open: data.o || 0,
                    prevClose: data.pc || 0,
                    change: data.d || 0,
                    changePercent: data.dp || 0,
                    timestamp: new Date().toISOString(),
                    volume: data.v || 0
                };
            } catch (error) {
                console.error(`Error fetching ${ticker}:`, error.message);
                priceData[ticker] = { error: true };
            }

            // Rate limiting: 1 request per 100ms to stay within API limits
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                data: priceData,
                count: tickers.length
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to fetch stock prices',
                details: error.message
            })
        };
    }
};
