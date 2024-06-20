import axios from 'axios';

const API_KEY = 'cpnb1mpr01qtggbb1hm0cpnb1mpr01qtggbb1hmg'; // Replace with your FinnHub API key

const fetchStockData = async () => {
  try {
    const symbolsResponse = await axios.get(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${API_KEY}`);
    const symbols = symbolsResponse.data.map((stock: any) => stock.symbol);

    const stockDataPromises = symbols.map(async (symbol: string) => {
      try {
        const [quoteResponse, profileResponse] = await Promise.all([
          axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`),
          axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`)
        ]);

        return {
          symbol,
          price: quoteResponse.data.c,
          sector: profileResponse.data.finnhubIndustry || 'Unknown'
        };
      } catch (error) {
        console.error(`Error fetching data for symbol ${symbol}:`, error);
        return {
          symbol,
          price: 0,
          sector: 'Unknown'
        };
      }
    });

    const stockData = await Promise.all(stockDataPromises);
    console.log('Stock Data:', stockData); // Log the fetched data
    return stockData;
  } catch (error) {
    console.error('Error fetching stock symbols:', error);
    return [];
  }
}

export default fetchStockData;
