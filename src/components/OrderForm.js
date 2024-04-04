import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios.js';
import './OrderForm.css';

const OrderForm = () => {
  const [type, setType] = useState('buy'); // 'buy' 또는 'sell'
  const [priceType, setPriceType] = useState('market'); // 'market', 'limit', 'reservation'
  const [price, setPrice] = useState(''); // 지정가격
  const [quantity, setQuantity] = useState(''); // 구매 주식수
  const { companyId } = useParams();

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
      // 주문 후 추가적인 작업 수행
    } catch (error) {
      alert(error.response.data.message);
      console.error(error);
    }
  };

  return (
    <div className="order-form-container" id="order-form-container">
      <form onSubmit={handleSubmit} id="order-form">
        <div className="form-sectionss">
          <div id="title">주문</div>
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
