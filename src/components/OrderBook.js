import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './OrderBook.css'; // CSS 스타일시트 임포트

function OrderBook() {
  const [orderBook, setOrderBook] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리
  const { companyId } = useParams();
  const ws = useRef(null);

  useEffect(() => {
    setIsLoading(true); // 데이터 요청 시작
    ws.current = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/ws/orderData/${companyId}`);

    ws.current.onopen = () => {
      console.log('Connected to WS server for order data');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'orderData') {
        // 메시지 타입 확인
        const { groupedOrders, currentPrice } = message.data;

        if (Array.isArray(groupedOrders)) {
          processOrderData(groupedOrders, currentPrice); // 호가 데이터 처리 로직
        } else {
          console.warn('Received data is not an array:', groupedOrders);
          setIsLoading(false);
        }
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WS server for order data');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [companyId]); // companyId가 변경될 때마다 useEffect가 재실행됩니다.

  // 호가 데이터 처리 로직을 별도의 함수로 분리
  function processOrderData(groupedOrders, currentPrice) {
    const maxQuantity = Math.max(...groupedOrders.map((order) => order._sum.quantity));
    let processedOrders = groupedOrders.map((order) => ({
      ...order,
      barLength: (order._sum.quantity / maxQuantity) * 100,
    }));

    // 가격 범위 생성 및 데이터 매핑 로직
    const priceRange = Array.from({ length: 11 }, (_, i) => currentPrice + 50000 - i * 10000);
    processedOrders = priceRange.map((price) => {
      const existingOrder = processedOrders.find((order) => order.price === price);
      return existingOrder || { price, _sum: { quantity: 0 }, type: 'none', barLength: 0 };
    });

    setOrderBook(processedOrders); // 업데이트된 주문 데이터 상태 업데이트
    setCurrentPrice(currentPrice);
    setIsLoading(false); // 데이터 로딩 완료
  }

  return (
    <div className="orderBook">
      <h2>호가창</h2>
      <table>
        <thead>
          <tr>
            <th>매도주문</th>
            <th>금액</th>
            <th>매수주문</th>
          </tr>
        </thead>
        {isLoading && <div className="loading-indicator">Loading...</div>}
        <tbody>
          {orderBook.map((order, index) => (
            <tr key={index}>
              <td className="order-cell">
                <div className={`bar sell-bar ${order.type === 'sell' ? 'visible' : ''}`} style={{ width: `${order.type === 'sell' ? order.barLength : 0}%` }}></div>
                <span className={`order-quantity ${order.type === 'sell' ? '' : 'order-quantity-buy'}`}>{order.type === 'sell' ? order._sum.quantity : ''}</span>
              </td>
              <td className="price-cell">{order.price}</td>
              <td className="order-cell">
                <div className={`bar buy-bar ${order.type === 'buy' ? 'visible' : ''}`} style={{ width: `${order.type === 'buy' ? order.barLength : 0}%` }}></div>
                <span className={`order-quantity ${order.type === 'buy' ? 'order-quantity-buy' : ''}`}>{order.type === 'buy' ? order._sum.quantity : ''}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderBook;
