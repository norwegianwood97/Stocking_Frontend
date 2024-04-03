// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './chartHeader.css';
import axios from '../api/axios';

const ChartHeader = () => {
  const { companyId } = useParams(); // URL에서 companyid 값을 가져옵니다.
  const [companyName, setCompanyName] = useState('');
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        // companyId 값을 POST 요청의 바디에 포함하여 서버로 보냅니다.
        const response = await axios.post('/api/companyName', { companyId: companyId });
        setCompanyName(response.data[0].name);
        // 여기에서 response.data를 활용한 추가 작업을 수행할 수 있습니다.
      } catch (error) {
        console.error('회사 이름을 가져오는데 실패했습니다.', error);
      }
    };

    fetchCompanyName();
  }, [companyId]); // companyId 값이 변경될 때마다 useEffect 훅을 다시 실행합니다.

  return (
    <header className="Header">
      <nav className="Header-nav">
        <div className="Header-group_one">
          <p>{companyName}</p>
        </div>
        <div className="Header-group_two">
          <a href="/order" className="Header-linkss" id="checkOrder">
            내가 한 주문 확인
          </a>
        </div>
      </nav>
    </header>
  );
};

export default ChartHeader;
