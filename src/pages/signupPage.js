import React, { useState } from 'react';
import axiosInstance from '../api/axios.js';
import { useNavigate } from 'react-router-dom';
import './signupPage.css';

function SignupPage() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isPasswordMatch, setIsPasswordMatch] = useState(false); // 새로운 상태 추가
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수를 가져옴

  const validateEmail = () => {
    if (!email) {
      setEmailError('');
    } else if (!email.includes('@')) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError('');
    } else if (password.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
    } else {
      setPasswordError('');
    }
  };

  const validateConfirmPassword = () => {
    // 먼저, 두 입력 필드가 비어 있지 않은지 확인
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
        setIsPasswordMatch(false); // 일치하지 않으면 false 상태
      } else {
        setConfirmPasswordError('비밀번호가 일치합니다.');
        setIsPasswordMatch(true); // 일치하면 true 상태
      }
    } else {
      setConfirmPasswordError(''); // 입력 필드가 비어 있으면 메시지 없음
      setIsPasswordMatch(false); // 기본 상태는 false로 설정
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   // if (!emailError && !passwordError && !confirmPasswordError) {
      try {
        const response = await axiosInstance.post('http://localhost:3000/api/sign-up', { nickname, email, password });
        if (response.status === 200) {
          // 회원가입 성공 시 리다이렉트
          alert(response.data.message);
          navigate('/login');
        }
      } catch (error) {
        alert(error.response.data.error.message);
        // 에러 처리
      }
//   }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">회원가입</h2>
        <p className="signup-subtitle">OO사이트에서 새로운 계정을 만드세요!</p>
        <form className="signup-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="이름" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={validateEmail} />
          {emailError && (
            <p className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
              {emailError}
            </p>
          )}
          <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={validatePassword} />
          {passwordError && (
            <p className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
              {passwordError}
            </p>
          )}
          <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={validateConfirmPassword} />
          {confirmPasswordError && <p className={`error-message ${isPasswordMatch ? 'success-message' : ''}`}>{confirmPasswordError}</p>}
          <button type="submit" className="submit-button">
            회원가입
          </button>
        </form>
        <div className="divider">
          <hr className="divider-line" />
          <span className="divider-text">OR</span>
          <hr className="divider-line" />
        </div>
        <div className="social-signup">{/* 소셜 회원가입 버튼 추가 */}</div>
        <div className="login-prompt">
          이미 계정이 있으신가요? <a href="/login">로그인</a>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
