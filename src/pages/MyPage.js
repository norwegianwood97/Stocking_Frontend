import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios.js';
import './MyPage.css';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({});
  const [rankings, setRankings] = useState([]);
  const [mmrRankings, setMmrRankings] = useState([]);
  const [newNickname, setNewNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
    axios
      .get('/api/rank')
      .then((response) => {
        setRankings(response.data); // 불러온 랭킹 데이터를 상태에 저장
      })
      .catch((error) => {
        console.error('Error fetching rankings:', error);
      });
    axios
      .get('/api/rank/mmr')
      .then((response) => {
        setMmrRankings(response.data); // 불러온 MMR 랭킹 데이터를 상태에 저장
      })
      .catch((error) => {
        console.error('Error fetching MMR rankings:', error);
      });
  }, []);
  const handleUserInfoUpdate = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 리로드 방지

    // 변경할 닉네임과 비밀번호를 조건부로 설정
    const requestBody = {};
    if (newNickname) requestBody.nickname = newNickname;
    if (newPassword) requestBody.password = newPassword;

    // 변경할 닉네임 또는 비밀번호가 있을 경우에만 요청을 보냄
    if (Object.keys(requestBody).length > 0) {
      axios
        .put('/api/user', requestBody)
        .then((response) => {
          alert('회원 정보가 성공적으로 업데이트 되었습니다.');
          // 여기서 추가적인 성공 처리를 할 수 있습니다. 예를 들면:
          // - 사용자 정보를 다시 불러오기
          // - 입력 필드 초기화
          // - 사용자를 다른 페이지로 리다이렉션하기 등
        })
        .catch((error) => {
          console.error('회원 정보 업데이트에 실패했습니다:', error);
          // 에러 처리
        });
    } else {
      alert('변경할 닉네임 또는 비밀번호를 입력해주세요.');
    }
  };
  const getRankClassName = (rank) => {
    switch (rank) {
      case 1:
        return 'rank-gold';
      case 2:
        return 'rank-silver';
      case 3:
        return 'rank-bronze';
      default:
        return '';
    }
  };

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
      <div className="MyInfo section">
        <h1>{isLoading ? <Skeleton width={200} /> : `${userInfo.nickname}님의 정보`}</h1>
        <p>자산: {isLoading ? <Skeleton /> : `${userInfo.currentMoney}원`}</p>
        <p>총 자산 가치: {isLoading ? <Skeleton /> : `${userInfo.totalAsset}원`}</p>
        <p>티어: {isLoading ? <Skeleton width={100} /> : <span className={getTierClassName(userInfo.tier)}>{userInfo.tier}</span>}</p>
        <p>총 수익률: {isLoading ? <Skeleton width={100} /> : `${(userInfo.initialSeed > 0 ? ((userInfo.totalAsset - userInfo.initialSeed) / userInfo.initialSeed) * 100 : 0).toFixed(2)}%`}</p>
      </div>
    );
  };
  const renderRankingsTable = () => {
    return (
      <div className="section-container section">
        <h1>대회 랭킹</h1>
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>이름</th>
              <th>수익률</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((ranking) => (
              <tr key={ranking.ranking} className={getRankClassName(ranking.ranking)}>
                <td>{ranking.ranking}</td>
                <td>{ranking.nickname}</td>
                <td>{ranking.earningRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMmrRankingsTable = () => {
    return (
      <div className="section-container section">
        <h1>MMR 랭킹</h1>
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>닉네임</th>
              <th>MMR</th>
              <th>티어</th>
            </tr>
          </thead>
          <tbody>
            {mmrRankings.map((ranking) => (
              <tr key={ranking.ranking} className={getRankClassName(ranking.ranking)}>
                <td>{ranking.ranking}</td>
                <td>{ranking.nickname}</td>
                <td>{ranking.mmr}</td>
                <td>
                  <span className={getTierClassName(ranking.tier)}>{ranking.tier}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  const renderUserInfoUpdateForm = () => {
    return (
      <form onSubmit={handleUserInfoUpdate} className="updateUserInfoForm section-container section">
        <h1>회원정보 수정</h1>
        <div>
          <label>변경할 닉네임</label>
          <input type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />
        </div>
        <div>
          <label>변경할 비밀번호</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button type="submit">변경하기</button>
      </form>
    );
  };
  return (
    <div className="MyPage">
      <div className="MyInfoContainer">{renderUserInfo()}</div>
      <div className="RankMMRModify">
        {renderRankingsTable()}
        {renderMmrRankingsTable()}
        {renderUserInfoUpdateForm()}
      </div>
    </div>
  );
};

export default MyPage;
