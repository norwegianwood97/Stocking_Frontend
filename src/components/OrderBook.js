import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './OrderBook.css'; // CSS 스타일시트 임포트

function OrderBook() {
  const [orderBook, setOrderBook] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리
  const { companyId } = useParams();

  useEffect(() => {
    setIsLoading(true); // 데이터 요청 시작
    const ws = new WebSocket(`wss://api.stockingchallenge.site/ws/chartData/${companyId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const groupedOrders = message.groupedOrders;
      const currentPrice = message.currentPrice;

      if (Array.isArray(groupedOrders)) {
        const maxQuantity = Math.max(...groupedOrders.map((order) => order._sum.quantity));
        let processedOrders = groupedOrders.map((order) => ({
          ...order,
          barLength: (order._sum.quantity / maxQuantity) * 100,
        }));

        // 가격 범위 생성
        const priceRange = Array.from({ length: 11 }, (_, i) => currentPrice + 50000 - i * 10000);

        // 가격 범위 내의 각 가격에 대해 주문 데이터가 있는지 확인, 없으면 빈 주문 데이터를 생성하여 추가
        processedOrders = priceRange.map((price) => {
          const existingOrder = processedOrders.find((order) => order.price === price);
          if (existingOrder) {
            return existingOrder;
          } else {
            // 주문이 없는 가격에 대한 객체 생성
            return {
              price,
              _sum: { quantity: 0 },
              type: 'none', // 'buy' 또는 'sell' 대신 'none' 사용
              barLength: 0, // 주문량이 없으므로 barLength는 0
            };
          }
        });

        // 최대 주문량 재계산을 위해 업데이트된 주문 데이터 사용
        const maxQuantityUpdated = Math.max(...processedOrders.map((order) => order._sum.quantity));
        processedOrders = processedOrders.map((order) => ({
          ...order,
          barLength: order._sum.quantity > 0 ? (order._sum.quantity / maxQuantityUpdated) * 100 : 0,
        }));

        setOrderBook(processedOrders); // 업데이트된 주문 데이터 상태 업데이트
        setCurrentPrice(currentPrice);
        setIsLoading(false); // 데이터 로딩 완료
      } else {
        console.warn('Received data is not an array:', groupedOrders);
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
