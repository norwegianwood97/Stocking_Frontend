import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function OrderBook() {
  const [orderBook, setOrderBook] = useState([]); // 주문 목록을 상태로 관리
  const { companyId } = useParams(); // URL 파라미터에서 companyId 추출

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8090?companyId=${companyId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (Array.isArray(message)) {
        // 데이터를 매도와 매수로 분리
        const sellOrders = message.filter((order) => order.type === 'sell');
        const buyOrders = message.filter((order) => order.type === 'buy');

        // 모든 금액을 추출하여 고유한 값으로 정렬
        const prices = [...new Set([...sellOrders, ...buyOrders].map((order) => order.price))].sort((a, b) => b - a);

        // 각 금액에 대해 매도와 매수 수량을 매핑
        const orderBook = prices.map((price) => {
          const sellQuantity = sellOrders.find((order) => order.price === price)?._sum.quantity || 0;
          const buyQuantity = buyOrders.find((order) => order.price === price)?._sum.quantity || 0;

          return { price, sellQuantity, buyQuantity };
        });

        setOrderBook(orderBook);
      } else {
        console.warn('Received data is not an array:', message);
      }
    };

    return () => {
      ws.close(); // 컴포넌트 언마운트 시 WebSocket 연결 종료
    };
  }, [companyId]);

  return (
    <div>
      <h2>Order Book</h2>
      <table>
        <thead>
          <tr>
            <th>매도주문</th>
            <th>금액</th>
            <th>매수주문</th>
          </tr>
        </thead>
        <tbody>
          {orderBook.map((order, index) => (
            <tr key={index}>
              <td>{order.sellQuantity}</td>
              <td>{order.price}</td>
              <td>{order.buyQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderBook;
