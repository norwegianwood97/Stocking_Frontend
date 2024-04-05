import React, { useState, useEffect } from 'react';
import axios from '../api/axios.js';
import ChartHeader from '../components/chartHeader';
import Chart from '../components/Chart';
import OrderBook from '../components/OrderBook';
import OrderForm from '../components/OrderForm';
import Chatting from '../components/Chatting.js';
import './chartPage.css';
import AssetInfo from '../components/AssetInfo.js';

function ChartPage() {
  const [userInfo, setUserInfo] = useState({});
  const [stocks, setStocks] = useState([]);

  // 데이터를 다시 불러오는 함수
  const refreshData = async () => {
    try {
      const userInfoResponse = await axios.get('/api/userGet');
      setUserInfo(userInfoResponse.data.data[0]);
      const stocksResponse = await axios.get('/api/stock');
      setStocks(stocksResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="StockDetailPage">
      <ChartHeader />
      <div className="chart-and-order-container">
        <Chart />
        <div className="orderBook-container">
          <OrderBook />
        </div>
        <div className="currentAsset">
          <AssetInfo />
        </div>
        <div className="order">
          <OrderForm />
        </div>
      </div>
      <div>
        <Chatting />
      </div>
    </div>
  );
}
export default ChartPage;
