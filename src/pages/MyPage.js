import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios.js';
import './MyPage.css';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

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
  }, []);

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

  return (
    <div className="MainPage">
      <div className="InfoStockCompany">
        <div className="Info">{renderUserInfo()}</div>
      </div>
    </div>
  );
};

export default MyPage;
