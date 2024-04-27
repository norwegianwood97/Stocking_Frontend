// ChartPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios.js';
import ChartHeader from '../components/chartHeader';
import Chart from '../components/Chart';
import OrderBook from '../components/OrderBook';
import OrderForm from '../components/OrderForm';
import Chatting from '../components/Chatting.js';
import AssetInfo from '../components/AssetInfo.js';
import './chartPage.css';

function ChartPage() {
  const { companyId } = useParams(); // URL에서 companyId를 가져옵니다.
  const [userInfo, setUserInfo] = useState({});
  const [stocks, setStocks] = useState([]);

  const refreshData = async () => {
    try {
      const userInfoResponse = await axios.get('/api/userGet');
      setUserInfo(userInfoResponse.data.data[0]);
      const stocksResponse = await axios.get('/api/stock'); // 모든 주식 데이터를 가져옵니다.
      // 서버에서 모든 주식 데이터를 반환하므로 클라이언트 측에서 필터링
      const filteredStocks = stocksResponse.data.filter((stock) => stock.companyId.toString() === companyId);
      console.log('Filtered stocks based on companyId: ', filteredStocks);
      setStocks(filteredStocks);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [companyId]); // companyId가 변경될 때마다 데이터 갱신

  return (
    <div className="StockDetailPage">
      <ChartHeader />
      <div className="chart-and-order-container">
        <Chart />
        <div className="orderBook-container">
          <OrderBook />
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
