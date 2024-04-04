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
    try {
      const response = await axios.get('/api/stock');
      // response.data가 배열인지 확인하고, 배열이 아니면 빈 배열을 설정
      if (Array.isArray(response.data)) {
        setStocks(response.data);
      } else {
        console.error('Expected an array for stocks, but got:', response.data);
        setStocks([]); // 배열이 아니라면 빈 배열로 초기화
      }
    } catch (error) {
      console.error('There was an error fetching the stock data:', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchUserInfo().then(() => setIsLoading(false));
    fetchStocks();
    // API 요청을 보내 사용자 정보를 가져옵니다.
    axios
      .get('/api/userGet')
      .then((response) => {
        // 첫 번째 사용자 정보를 상태에 저장합니다.
        setUserInfo(response.data.data[0]);
        setIsLoading(false); // 데이터 로딩 완료
      })
      .catch((error) => {
        console.error('There was an error fetching the user data:', error);
        if (error.response && error.response.status === 401) {
          // 여기서 /login으로 리다이렉트합니다.
          window.location = '/login';
        }
        setIsLoading(false); // 데이터 로딩 완료
      });
    axios
      .get('/api/stock')
      .then((response) => {
        // response.data가 객체이고 message 프로퍼티를 가지고 있는지 확인
        if (typeof response.data === 'object' && !Array.isArray(response.data) && response.data.message) {
          console.log('Message from server:', response.data.message);
          return; // 추가 처리 없이 함수 종료
        }
        // response.data가 비어있는 배열인 경우도 처리
        if (Array.isArray(response.data) && response.data.length === 0) {
          return; // 빈 배열인 경우 추가 처리 없이 함수 종료
        }
        // 정상적인 경우, 주식 정보로 상태 업데이트
        setStocks(response.data);
      })
      .catch((error) => {
        console.error('There was an error fetching the stock data:', error);
      });

    axios
      .get('/api/company')
      .then((response) => {
        setCompanies(response.data); // 받아온 회사 정보로 상태 업데이트
      })
      .catch((error) => {
        console.error('There was an error fetching the company data:', error);
      });
  }, []); // 빈 배열을 넘겨주어 컴포넌트 마운트 시에만 요청을 보냅니다.

  const renderUserInfo = () => {
    return (
      <div className="user-info-container">
        <table className="user-info-table">
          <tbody>
            <tr>자산: {userInfo.currentMoney}원</tr>
            <tr>총액: {userInfo.totalAsset}원</tr>
            {/* Add more rows for additional user info if necessary */}
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
            주문
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
