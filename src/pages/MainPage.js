import React, { useState, useEffect } from 'react';
import axios from '../api/axios.js';
import './MainPage.css';

const MainPage = () => {
  const [userInfo, setUserInfo] = useState({
    nickname: '회원',
    currentMoney: '0',
    totalAsset: '0',
    initialSeed: '1',
    tier: 'bronze',
  });
  const [stocks, setStocks] = useState([]);
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    // API 요청을 보내 사용자 정보를 가져옵니다.
    axios
      .get('/api/userGet')
      .then((response) => {
        // 첫 번째 사용자 정보를 상태에 저장합니다.
        setUserInfo(response.data.data[0]);
      })
      .catch((error) => {
        console.error('There was an error fetching the user data:', error);
        if (error.response && error.response.status === 401) {
          // 여기서 /login으로 리다이렉트합니다.
          window.location = '/login';
        }
      });
    axios
      .get('/api/stock')
      .then((response) => {
        setStocks(response.data); // 받아온 주식 정보로 상태 업데이트
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
    // 총 수익률 계산, initialSeed가 0으로 설정되어 있으면, 분모가 0이 되어버리므로 계산 방식을 조정해야 합니다.
    const profitRate = userInfo.initialSeed > 0 ? ((userInfo.totalAsset - userInfo.initialSeed) / userInfo.initialSeed) * 100 : 0; // initialSeed가 0이라면 총 수익률도 0으로 설정

    return (
      <div className="Info">
        <h1>{`${userInfo.nickname}님의 정보`}</h1>
        <p>자산: {userInfo.currentMoney}원</p>
        <p>총액: {userInfo.totalAsset}원</p>
        <p>티어: {userInfo.tier}</p>
        <p>총 수익률: {profitRate.toFixed(2)}%</p>
      </div>
    );
  };

  const renderStocksTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>회사명</th>
            <th>주식 수</th>
            <th>현재가</th>
            <th>평단가</th>
            <th>수익률</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const profitRate = ((stock.Company.currentPrice - stock.averagePrice) / stock.averagePrice) * 100;
            return (
              <tr key={stock.stockId}>
                <td>{stock.Company.name}</td>
                <td>{stock.quantity}</td>
                <td>{stock.Company.currentPrice}원</td>
                <td>{stock.averagePrice}원</td>
                <td>{profitRate.toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };
  const renderCompaniesTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>회사명</th>
            <th>현재가</th>
            <th>등락률</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.companyId}>
              <td>{company.name}</td>
              <td>{company.currentPrice}원</td>
              <td>{company.fluctuationRate.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  return (
    <div className="MainPage">
      <div className="InfoRankingLike">
        <div className="Info">{renderUserInfo()}</div>
        <div className="Stock">
          <h1>보유 주식</h1>
          {renderStocksTable()}
        </div>
        <div className="Compnay">
          <h1>회사 목록</h1>
          {renderCompaniesTable()}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
