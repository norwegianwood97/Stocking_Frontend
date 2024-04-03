// src/components/Header.js
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './chartHeader.css';

const ChartHeader = () => {
  const COMPANY_IDS = ['회사1', '회사2', '회사3'];
  const { companyId } = useParams(); // URL에서 companyid 값을 가져옵니다.

  const companyIndex = parseInt(companyId, 10) - 1;
  const companyName = COMPANY_IDS[companyIndex];

  return (
    <header className="Header">
      <nav className="Header-nav">
        <div className="Header-group_one">
          <p>종목명: {companyName}</p>
        </div>
        <div className="Header-group_two">
          <Link to="/order" className="Header-link">
            내가 한 주문 확인
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default ChartHeader;
