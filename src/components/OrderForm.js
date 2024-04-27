import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios.js';
import './OrderForm.css';

const OrderForm = () => {
  const [type, setType] = useState('buy'); // 'buy' 또는 'sell'
  const [priceType, setPriceType] = useState('market'); // 'market', 'limit', 'reservation'
  const [price, setPrice] = useState(''); // 지정가격
  const [quantity, setQuantity] = useState(''); // 구매 주식수
  const { companyId } = useParams();
  //추가
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [stocks, setStocks] = useState([]);

  // 사용자 정보를 가져오는 함수입니다.
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/api/userGet');
      setUserInfo(response.data.data[0]);
    } catch (error) {
      console.error('There was an error fetching the user data:', error);
    }
  };

  // 주식 정보를 가져오는 함수입니다.
  const fetchStocks = async () => {
    const response = await axios.get('/api/stock');
    if (Array.isArray(response.data)) {
      const filteredStocks = response.data.filter((stock) => stock.companyId.toString() === companyId);
      setStocks(filteredStocks);
    } else {
      setStocks([]); // 데이터가 배열 형태가 아니라면 빈 배열로 초기화
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log(type);
      const response = await axios.post('/api/order', {
        companyId,
        type,
        price: priceType === 'limit' ? price : null,
        quantity,
      });
      alert(response.data.message);
      console.log(response.data);
      // 주문 후 사용자 정보와 주식 정보를 갱신합니다.
      await fetchUserInfo();
      await fetchStocks();
    } catch (error) {
      alert(error.response.data.message);
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchUserInfo();
        await fetchStocks();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [companyId]);

  const renderUserInfo = () => {
    return (
      <div className="user-info-container">
        <table className="user-info-table">
          <tbody>
            <tr>예수금 : {userInfo.currentMoney}원</tr>
            <tr>순자산 : {userInfo.totalAsset}원</tr>
            <tr>가용 금액: {userInfo.tradableMoney}원</tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderStocksTable = () => {
    return (
      <div className="stock-info-container">
        {stocks.map((stock) => {
          return (
            <table className="stock-info-table" key={stock.stockId}>
              <tbody>
                <tr>회사명: {stock.Company.name}</tr>
                <tr>주식 수: {stock.quantity}</tr>
                <tr>가용 주식: {stock.tradableQuantity}</tr>
                <tr>현재가: {stock.Company.currentPrice}원</tr>
                <tr>평단가: {stock.averagePrice.toFixed(0)}원</tr>
                <tr>&nbsp;</tr>
              </tbody>
            </table>
          );
        })}
      </div>
    );
  };

  return (
    <div className="order-form-container" id="order-form-container">
      <div className="userInfo">
        현재 자산
        {renderUserInfo()}
        <hr></hr>
        {renderStocksTable()}
      </div>
      <form onSubmit={handleSubmit} id="order-form">
        <div id="title">주문</div>
        <div className="form-section-order">
          <button type="button" className={`button_chart ${type === 'buy' ? 'active' : 'inactive'}`} onClick={() => setType('buy')}>
            매수
          </button>
          <button type="button" className={`button_chart ${type === 'sell' ? 'active' : 'inactive'}`} onClick={() => setType('sell')}>
            매도
          </button>
        </div>
        <div id="form-section">
          <button type="button" className={`button_priceType ${priceType === 'market' ? 'active' : 'inactive'}`} onClick={() => setPriceType('market')} disabled={priceType === 'market'}>
            시장가
          </button>
          <button type="button" className={`button_priceType ${priceType === 'limit' ? 'active' : 'inactive'}`} onClick={() => setPriceType('limit')} disabled={priceType === 'limit'}>
            지정가
          </button>
        </div>
        {priceType !== 'market' && (
          <div className="form-sectionss">
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="지정금액" />
          </div>
        )}
        <div className="form-sectionss">
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="구매 주식수" />
        </div>
        <div className="form-section">
          <button type="submit" className="submit-buttossn">
            주문 입력
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
