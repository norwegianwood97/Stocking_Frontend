import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios.js';
import './MainPage.css';

const MainPage = () => {
  const [userInfo, setUserInfo] = useState({});
  const [stocks, setStocks] = useState([]);
  const [companies, setCompanies] = useState([]);

  const navigate = useNavigate();
  const goToCompanyPage = (companyId) => {
    navigate(`/company/${companyId}`); // 프로그래밍 방식으로 페이지 이동
  };
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
  const getTierClassName = (tier) => {
    switch (tier) {
      case 'bronze':
        return 'tier-bronze';
      case 'silver':
        return 'tier-silver';
      case 'gold':
        return 'tier-gold';
      case 'platinum':
        return 'tier-platinum';
      case 'diamond':
        return 'tier-diamond';
      default:
        return '';
    }
  };
  const renderUserInfo = () => {
    // 총 수익률 계산, initialSeed가 0으로 설정되어 있으면, 분모가 0이 되어버리므로 계산 방식을 조정해야 합니다.
    const profitRate = userInfo.initialSeed > 0 ? ((userInfo.totalAsset - userInfo.initialSeed) / userInfo.initialSeed) * 100 : 0; // initialSeed가 0이라면 총 수익률도 0으로 설정

    return (
      <div className="Info">
        <h1>{`${userInfo.nickname}님의 정보`}</h1>
        <p>자산: {userInfo.currentMoney}원</p>
        <p>총액: {userInfo.totalAsset}원</p>
        <p>
          티어: <span className={getTierClassName(userInfo.tier)}>{userInfo.tier}</span>
        </p>
        <p>총 수익률: {profitRate.toFixed(2)}%</p>
      </div>
    );
  };

  const renderStocksTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th className="company-name">회사명</th>
            <th className="stock-quantity">주식 수</th>
            <th className="current-price">현재가</th>
            <th className="average-price">평단가</th>
            <th className="profit-rate">수익률</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const profitRate = ((stock.Company.currentPrice - stock.averagePrice) / stock.averagePrice) * 100;
            let className = profitRate > 0 ? 'positive' : 'negative';
            if (profitRate === 0) className = 'zero';

            return (
              <tr key={stock.stockId} onClick={() => goToCompanyPage(stock.companyId)} className={className}>
                <td className="company-name">{stock.Company.name}</td>
                <td className="stock-quantity">{stock.quantity}</td>
                <td className="current-price-content">{stock.Company.currentPrice}원</td>
                <td className="average-price-content">{stock.averagePrice}원</td>
                <td className="profit-rate">{(((stock.Company.currentPrice - stock.averagePrice) / stock.averagePrice) * 100).toFixed(2)}%</td>
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
            <th className="company-name2">회사명</th>
            <th className="current-price2">현재가</th>
            <th className="fluctuation-rate2">등락률</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => {
            let className = company.fluctuationRate > 0 ? 'positive' : 'negative';
            if (company.fluctuationRate === 0) className = 'zero';

            return (
              <tr key={company.companyId} onClick={() => goToCompanyPage(company.companyId)} className={className}>
                <td className="company-name2">{company.name}</td>
                <td className="current-price2-content">{company.currentPrice}원</td>
                <td className="fluctuation-rate2-content">{company.fluctuationRate.toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="MainPage">
      <div className="InfoStockCompany">
        <div className="Info">{renderUserInfo()}</div>
        <div className="Stock">
          <h1>보유 주식</h1>
          {renderStocksTable()}
        </div>
        <div className="Company">
          <h1>회사 목록</h1>
          {renderCompaniesTable()}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
