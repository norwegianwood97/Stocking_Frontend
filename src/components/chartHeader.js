// src/components/Header.js
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Header.css';

const ChartHeader = () => {
  const COMPANY_IDS = ['company1', 'company2', 'company3'];
  const { companyid } = useParams(); // URL에서 companyid 값을 가져옵니다.

  const companyIndex = parseInt(companyid, 10) - 1;
  const companyName = COMPANY_IDS[companyIndex];

  return (
    <header className="Header">
      <nav className="Header-nav">
        <div className="Header-group_one">
          <p>종목명: {companyName}</p>
        </div>
        <div className="Header-group_two">
          <Link to="/orders" className="Header-link">
            내가 한 주문 확인
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default ChartHeader;
