import React from 'react';
import ChartHeader from '../components/chartHeader';
import Chart from '../components/Chart';
import OrderBook from '../components/OrderBook';
import OrderForm from '../components/OrderForm';
import './chartPage.css';

function ChartPage() {
  return (
    <div className="StockDetailPage">
      <ChartHeader />
      <div className="chart-and-order-container">
        <Chart />
        <div className="orderBook-container">
          <OrderBook />
        </div>
        <div className="currentAsset-and-order">
          <OrderForm />
        </div>
      </div>
    </div>
  );
}
export default ChartPage;