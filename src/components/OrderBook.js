import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './OrderBook.css'; // CSS 스타일시트 임포트

function OrderBook() {
  const [orderBook, setOrderBook] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const { companyId } = useParams();

  useEffect(() => {
    setIsLoading(true); // 데이터 요청 시작
    const ws = new WebSocket(`ws://localhost:8090?companyId=${companyId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (Array.isArray(message)) {
        const maxQuantity = Math.max(...message.map((order) => order._sum.quantity));
        const processedOrders = message.map((order) => ({
          ...order,
          barLength: (order._sum.quantity / maxQuantity) * 100,
        }));

        setOrderBook(processedOrders);
        setIsLoading(false); // 데이터 로딩 완료
      } else {
        console.warn('Received data is not an array:', message);
        setIsLoading(false);
      }
    };

    return () => ws.close();
  }, [companyId]);

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
        {isLoading && <div className="loading-indicator">Loading...</div>} {/* 로딩 인디케이터 추가 */}
        <tbody>
          {orderBook.map(
            (order, index) =>
              order._sum.quantity > 0 && ( // 수량이 0보다 클 때만 해당 행을 렌더링
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
              )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrderBook;
