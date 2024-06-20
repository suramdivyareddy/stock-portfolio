import React, { useState, useEffect, useCallback } from 'react';
import fetchStockData from './services/fetchStockData';
import './App.css';

// Define the Stock interface to type the stock data
interface Stock {
  symbol: string;
  price: number;
  sector: string;
}

const App: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [diversityScore, setDiversityScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAlreadySelected, setShowAlreadySelected] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const data = await fetchStockData();
        console.log('Fetched Data:', data);
        setStocks(data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const calculateDiversityScore = useCallback(() => {
    const sectorWeights: { [key: string]: number } = {};
    selectedStocks.forEach(stock => {
      sectorWeights[stock.sector] = (sectorWeights[stock.sector] || 0) + stock.price;
    });
    const totalValue = selectedStocks.reduce((total, stock) => total + stock.price, 0);
    let diversity = 1 - Object.values(sectorWeights).reduce((sum, weight) => sum + Math.pow(weight / totalValue, 2), 0);
    setDiversityScore(diversity * 100);
  }, [selectedStocks]);

  useEffect(() => {
    if (selectedStocks.length > 0) {
      calculateDiversityScore();
    }
  }, [selectedStocks, calculateDiversityScore]);

  const selectStock = (stock: Stock) => {
    if (selectedStocks.find(s => s.symbol === stock.symbol)) {
      setShowAlreadySelected(true);
      setTimeout(() => setShowAlreadySelected(false), 2000);
    } else {
      setSelectedStocks([...selectedStocks, stock]);
    }
  };

  const removeStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(stock => stock.symbol !== symbol));
  };

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <h1>Stock Portfolio Diversity Calculator</h1>
      <input
        type="text"
        placeholder="Search stocks..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <div className="stocks-container">
        <div className="all-stocks">
          <h2>All Stocks</h2>
          <div className="stocks-list">
            {loading ? (
              <p>Fetching stock data...</p>
            ) : (
              filteredStocks.map(stock => (
                <div key={stock.symbol} className="stock-item" onClick={() => selectStock(stock)}>
                  <h3>{stock.symbol}</h3>
                  <p>Price: ${stock.price.toFixed(2)}</p>
                  <p>Sector: {stock.sector}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="selected-stocks">
          <h2>Selected Stocks</h2>
          <div className="stocks-list">
            {selectedStocks.map(stock => (
              <div key={stock.symbol} className="stock-item">
                <h3>{stock.symbol}</h3>
                <p>Price: ${stock.price.toFixed(2)}</p>
                <p>Sector: {stock.sector}</p>
                <button className="remove-button" onClick={() => removeStock(stock.symbol)}>X</button>
              </div>
            ))}
          </div>
        </div>
        <div className="portfolio-diversity">
          <h2>Stock Portfolio Diversity</h2>
          <p>{selectedStocks.length === 0 ? 'Add stocks to calculate diversity' : diversityScore.toFixed(2)}</p>
        </div>
      </div>
      {showAlreadySelected && <div className="dialog">Stock already selected</div>}
    </div>
  );
}

export default App;
