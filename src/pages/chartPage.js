import React from 'react';
import ChartHeader from '../components/chartHeader';
import Chart from '../components/Chart';
import OrderBook from '../components/OrderBook';
import OrderForm from '../components/OrderForm';
import Chatting from '../components/Chatting.js';
import './chartPage.css';
import AssetInfo from '../components/AssetInfo.js';

function ChartPage() {
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