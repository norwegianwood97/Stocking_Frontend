// src/components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  // 하트 아이콘의 활성화 상태를 추적하는 상태(state) 변수와 설정 함수
  const [isHeartActive, setIsHeartActive] = useState(false);

  // 하트 아이콘 클릭 핸들러
  const toggleHeart = () => {
    setIsHeartActive(!isHeartActive); // 상태를 반전시킴
  };

  return (
    <header className="Header">
      <nav className="Header-nav">
        <div className="Header-group_one">
          <Link to="/" className="Header-link">
            홈화면
          </Link>
          <p>종목명</p>
        </div>
        <div className="Header-group_two">
          <Link to="/orders" className="Header-link">
            내가 한 주문 확인
          </Link>
          <Link to="/profile" className="Header-link">
            내정보
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
