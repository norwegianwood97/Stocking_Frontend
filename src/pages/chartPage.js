import React from 'react';
import Header from '../components/Header';
import Chart from '../components/Chart';
import OrderBook from '../components/OrderBook';
import OrderForm from '../components/OrderForm';
import './chartPage.css';

function ChartPage() {
  return (
    <div className="StockDetailPage">
      <Header />
      <div className="chart-and-order-container">
        <Chart />
        <OrderBook />
        <OrderForm />
      </div>
    </div>
  );
}
export default ChartPage;
