import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios.js';
import Chatting from '../components/Chatting.js';
import './MainPage.css';

const MainPage = () => {
  const [userInfo, setUserInfo] = useState({});
  const [stocks, setStocks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const goToCompanyPage = (companyId) => {
    navigate(`/company/${companyId}`); // 프로그래밍 방식으로 페이지 이동
  };
  useEffect(() => {
    setIsLoading(true);
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
    return (
      <div className="Info">
        <h1>{isLoading ? <Skeleton width={200} /> : `${userInfo.nickname}님의 정보`}</h1>
        <p>자산: {isLoading ? <Skeleton /> : `${userInfo.currentMoney}원`}</p>
        <p>총액: {isLoading ? <Skeleton /> : `${userInfo.totalAsset}원`}</p>
        <p>티어: {isLoading ? <Skeleton width={100} /> : <span className={getTierClassName(userInfo.tier)}>{userInfo.tier}</span>}</p>
        <p>총 수익률: {isLoading ? <Skeleton width={100} /> : `${(userInfo.initialSeed > 0 ? ((userInfo.totalAsset - userInfo.initialSeed) / userInfo.initialSeed) * 100 : 0).toFixed(2)}%`}</p>
      </div>
    );
  };

  const renderStocksTable = () => {
    return (
      <table className="stocktable">
        <thead>
          <tr className="stocktable-tr">
            <th className="company-name-th">회사명</th>
            <th className="stock-quantity-th">주식 수</th>
            <th className="current-price-th">현재가</th>
            <th className="average-price-th">평단가</th>
            <th className="profit-rate-th">수익률</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const profitRate = ((stock.Company.currentPrice - stock.averagePrice) / stock.averagePrice) * 100;
            let className = profitRate > 0 ? 'positive' : 'negative';
            if (profitRate === 0) className = 'zero';

            return (
              <tr key={stock.stockId} onClick={() => goToCompanyPage(stock.companyId)} className={className}>
                <td className="company-name-td">{stock.Company.name}</td>
                <td className="stock-quantity-td">{stock.quantity}</td>
                <td className="current-price-td">{stock.Company.currentPrice}원</td>
                <td className="average-price-td">{stock.averagePrice.toFixed(2)}원</td>
                <td className="profit-rate-td">{(((stock.Company.currentPrice - stock.averagePrice) / stock.averagePrice) * 100).toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderCompaniesTable = () => {
    return (
      <table className="companytable">
        <thead>
          <tr className="companytable-tr">
            <th className="company-name2-th">회사명</th>
            <th className="current-price2-th">현재가</th>
            <th className="fluctuation-rate2-th">등락률</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => {
            let className = company.fluctuationRate > 0 ? 'positive' : 'negative';
            if (company.fluctuationRate === 0) className = 'zero';

            return (
              <tr key={company.companyId} onClick={() => goToCompanyPage(company.companyId)} className={className}>
                <td className="company-name2-td">{company.name}</td>
                <td className="current-price2-td">{company.currentPrice}원</td>
                <td className="fluctuation-rate2-td">{company.fluctuationRate.toFixed(2)}%</td>
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
        {renderUserInfo()}
        <div className="Stock">
          <h1>보유 주식</h1>
          {renderStocksTable()}
        </div>
        <div className="Company">
          <h1>종목 목록</h1>
          {renderCompaniesTable()}
        </div>
      </div>
      <div>
        <Chatting />
      </div>
    </div>
  );
};

export default MainPage;
