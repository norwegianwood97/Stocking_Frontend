// AssetInfo.js
import React, { useEffect, useState } from 'react';
import axios from '../api/axios.js';
import './AssetInfo.css';

const AssetInfo = ({ stocks }) => {
  // props로 stocks를 받아옵니다.
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState([]);

  // 사용자 정보를 가져오는 함수입니다.
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/api/userGet');
      setUserInfo(response.data.data[0]);
      setIsLoading(false); // 로딩 상태 업데이트
    } catch (error) {
      console.error('There was an error fetching the user data:', error);
      setIsLoading(false); // 에러 발생 시에도 로딩 상태 업데이트
    }
  };

  useEffect(() => {
    fetchUserInfo();
    // 종목 정보 요청은 더 이상 여기서 하지 않습니다.
  }, []); // 의존성 배열을 비워 컴포넌트 마운트 시에만 요청을 보냅니다.

  const renderUserInfo = () => (
    <div className="user-info-container">
      <table className="user-info-table">
        <tbody>
          <tr>자산: {userInfo.currentMoney}원</tr>
          <tr>총액: {userInfo.totalAsset}원</tr>
          {/* 필요하다면 추가 정보 표시 */}
        </tbody>
      </table>
    </div>
  );

  const renderStocksTable = () => (
    <div className="stock-info-container">
      {stocks.map((stock) => (
        <table className="stock-info-table" key={stock.stockId}>
          <tbody>
            <tr>회사명: {stock.Company.name}</tr>
            <tr>주식 수: {stock.quantity}</tr>
            <tr>현재가: {stock.Company.currentPrice}원</tr>
            <tr>평단가: {stock.averagePrice.toFixed(0)}원</tr>
            <tr>&nbsp;</tr>
          </tbody>
        </table>
      ))}
    </div>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="userInfo">
      <div>현재 자산</div>
      {renderUserInfo()}
      <hr></hr>
      {renderStocksTable()}
    </div>
  );
};

export default AssetInfo;
