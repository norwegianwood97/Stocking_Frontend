import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios.js';
import './header.css';
import logoImage from '../assets/logo.png';
import homeIcon from '../assets/home_icon.png';
import userIcon from '../assets/user_icon2.png';

const Header = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const modalRef = useRef();
  const navigate = useNavigate();

  // 모달 외부 클릭을 감지하는 함수
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setModalOpen(false);
    }
  };
  // 닉네임을 가져오는 함수
  const fetchNickname = async () => {
    try {
      const response = await axios.get('/api/nickname');
      setNickname(response.data[0].nickname); // 닉네임 상태 업데이트
    } catch (error) {
      console.error('닉네임을 가져오는데 실패했습니다.', error);
    }
  };
  useEffect(() => {
    fetchNickname();
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const goToMyPage = () => {
    navigate('/mypage');
  };
  const handleLogout = async () => {
    try {
      await axios.delete('/api/logout'); // Perform the delete operation
      navigate('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/">
          <img src={homeIcon} alt="Home" />
        </Link>
      </div>
      <div className="header-center">
        <img src={logoImage} alt="Logo" />
      </div>
      <div className="header-right">
        <button onClick={() => setModalOpen(true)} style={{ background: 'none', border: 'none', padding: 0 }}>
          <img src={userIcon} alt="My Info" style={{ cursor: 'pointer' }} />
        </button>
      </div>
      {isModalOpen && (
        <div className="modal" ref={modalRef}>
          <h3>{nickname}님, 안녕하세요!</h3>
          <button onClick={goToMyPage} className="button-link my-info-button">
            내 정보
          </button>
          <button onClick={handleLogout} className="button-link logout-button">
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
