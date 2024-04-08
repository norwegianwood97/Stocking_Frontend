import React, { useState, useEffect } from 'react';
import axios from '../api/axios.js';
import './LoginPage.css'; // 스타일시트 임포트
import { useNavigate, useLocation } from 'react-router-dom';

function LoginPage() {
  // 이곳에 로그인 로직을 추가하세요.
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate(); // useNavigate hook 추가

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'emailAlreadyExists':
          alert('이 이메일은 이미 가입되어 있습니다 다른 메일을 이용하시거나 원래 사용하셨던 방식으로 로그인해주세요.');
          break;
        // 기타 다른 에러 타입에 대한 처리
        default:
          alert('로그인 중 알 수 없는 오류가 발생했습니다. 다시 소셜 로그인을 시도해 주세요');
      }
      navigate('/login');
    }
  }, [location.search, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault(); // 폼 제출 기본 이벤트 방지

    try {
      const response = await axios.post('/api/login', {
        email,
        password,
      }); // withCredentials 옵션을 true로 설정

      if (response.data && response.data.message) {
        if (response.data.message === '이미 로그인 된상태 입니다') {
          // 이미 로그인된 상태라는 메시지가 온 경우
          alert('이미 로그인 된상태 입니다');
          navigate('/'); // 메인 페이지로 리다이렉
        } else {
          // 다른 메시지가 온 경우 (예: 로그인 성공)
          navigate('/'); // 홈 페이지로 리다이렉트
        }
      } else if (response.data && response.data.redirectURL) {
        alert('메일 인증을 하고 시도해주세요');
        window.location.href = response.data.redirectURL;
      }
    } catch (error) {
      console.log(error.response.data.message.message);
      alert(`${error.response.data.message.message}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">로그인</h2>
        <p className="login-subtitle">모의주식투자를 위한 OO사이트에 오신 것을 환영합니다!</p>
        <form className="login-form" onSubmit={handleLogin}>
          <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">로그인</button>
        </form>
        <div className="divider">
          <hr className="divider-line" />
          <span className="divider-text">OR</span>
          <hr className="divider-line" />
        </div>
        <div className="social-login">
          {/* 이곳에 소셜 로그인 버튼을 추가하세요. */}
          <a href={`${process.env.REACT_APP_API_URL}/api/auth/naver`}>
            <img
              src="data:image/jpeg;base64,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"
              alt="Naver"
            />
          </a>
          <a href={`${process.env.REACT_APP_API_URL}/api/auth/kakao`}>
            <img
              src="data:image/png;base64,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"
              alt="Kakao"
            />
          </a>
          <a href={`${process.env.REACT_APP_API_URL}/api/auth/google`}>
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAABVlBMVEX////qQzU0qFNChfT7vAX5+/9Sj/U3gPSmw/lRjfX7uQDpOirqQTMwp1D7uADqPS4opUvpNSPpMR4fo0bpNiX+9vX8wADsWE362df98fD74d/97Ov/+vk9gvQzfvTQ6daTzaH3/PjucGfsXlT2t7PtZlzrSTvrVEjxiYLT4fys2LZHr2KAxZG13L70qaTylI73wb3509HznZfvd2/whH37wir+7sv80Wn93JH7xkP/+ej81X/95K/u9P5onPb96L/94J6Zuvl9p/dctnLf8OO0y/pru37A1Pvt9/AxqUL4ycb0pJ/tYEPxfDzpODj1nTn5sCb8zlzvcUHzjjb3qDH0kDb+9N7yg0L2qUfb5vyErffLyWeUvmXqwTdltWXLwlStvlbewkSEuWDAv1Ccu1XnvRdcsmBds4lTmNpPoLdMp5JBqmxRlOVTnsdOpaF2wYhQms1TpajAFMkRAAAMKklEQVR4nO2c63faRhqHhcDGRpJ1wwaMMVcDAQy2sdMmbRInEILtNE26vWyyTdt0u9ttd7vZ/f+/rK4I0HU0oxmJs78vaU4PGT2815l5BUVh0FHp8LY17F6OGyfNTrudarc7hWbjcjRsnRXLR0c4HiEylYutUaPDS5KYZ3ieZ1WlUtofyl+ZvChJTGc8aimgpB8VXKXbu3EzJSlkKpS7FFYmL/GF8fC8RPqZg+vo/KLJi35sa5x5kS9cnCfAlkfFuxPF94LDLWMyktQYHpJG8FRxVJAYHhzOEp+XmhdF0hwuOh91RCaE7WyQTL5wVyZNY1Np2JZQ4OliFUu2YhWT55dSHhmeLl7kR3EJyVKrKfGI+VSxTL5xSxpO0f4FK0LlFi9GXiycEeYrjRBGnyOklCIZkOULPlo+nZGYHfdHLOr04sbYIFIhW6no7WeKF8fYC2SxKWHjU8VII6ydebkrRZU/3cTmU0N8gEMMCcaBUTzB5KrlE7wOaokXWzgAW3CbBygpWTVyM5bHpAyoi2cjNuMZy5DkS6nR2IgyqXbJGlAXL0bWj5dP8qTpNLFiRHXjvE0uxayKFcdRAA7j4KGmmA7ynHp0GSdAJRh5xMG434hHCFpipTukgAXSRcIupo1wZ1xOxSXHWGKaCAGLcQQ82UcHeEtiI+EjpokQ8DxeSVQTU0Dooud4zmKAhNRFi1Gc9UIKKeBhHAELKAFjmWRQ1sHY9NqWkLroUTOGgCjLBDWOYauGskxQI4k0j01IY5BqiaR5bEIag9R5/NIo2hgshZkXiVZoY5BqRJRG9cGvMGJOkAIOEQchq0+xSVKeZ/Pqn+qkGxAq2hikiggHR1heQeqMR8Oz4mG5tK+oVD4s3g5HjbYGHGwlxC561EHkoywvsoVuy/UGt9i67PBiAGOiLRMUdYmk1LOM1Lk88z31K59d+g4bIXZR6gxBqWd5qX1RDPjFl267Ka8rV9SA+ynoIFSyyRjwPPOs6WpIxDFIUV1YH2XF9l2IL/2wm3I8T0BcJpRmRoQzISt1ws74lO5Yux1RuyhFFaDyKJtPnUF85fYZK7StmqoLmFrPMgzsWXupuzImh7pMKMEAc3bIil0E97PFghUnyGNQ2fVC+Gi+c47mIYbmMAT6GIRJM6zURfZ9l0+050DvohR1EtqETBuRAXVdKIgRuCh1G7qbEceI/em2LaF3UaVShPRRVrpA/izlywgAWyFNyEqkZ5WDqh3OhHwqrq+ArOt67+WrMIDtuLw14KurTOYLcES+Hb/3W1z0ZC+TOfjyFaCn8ihvgiLWg4yig9dgnsp3kvPa4P29jIYI5KlsKjEuSlFvchldB98E9lRWSkySoaiHexlTB68Dlg1WRNqpRazrXMZCzH0VyFOjmoKMRleZZR38KYCnMpekHxpE93OZVcSvfT2V75B+aCB9skbo76lsPkFpVMkzGbsOvvP0VAnLuw/I9PmeE6KXp/IN0s8MJpuT6ojurTjLJ8pHqboTn8b4hYunJsxHtabbBfFLR09lk5VHlzo2B8TXLx0QpSQ1M6rcARXEg69snspH8r5DhFov9zZPXUNkmQQ13Jo+9Sa0teLJatdUPfAGVDeNyw0OKybNhE4NjY1xadOYuCj0qBXLiFaDIyXl8HChz3zC0EA0Gxz+hPQDA+tNEMDMYtMoJuWAe6H6QUBC3VPZVHKODw19GyQMDcTXL18xXdIPDKzPA4WhyfhdPmkNW9BEs0D88xbcclu4ZC155Y+1pNxncIDU42082n20WBLIhJncE0jC3Uoai47vmSs+DJ5oVO3VYQnxAKazO+aK98EIH0ACYiOsPDNXBEqlmdx1UgjTaXNFv63TmpPeTwzhsZlqPE4wnGwIPeKCj9BMNWDFAjoM8RFmnxsrAgFCV0OchE/1BV2PSp0Jr5NDWHmsL/gtECF8osGYS41k6nPOtm7Dh0ki3ApBmEkSYUUvF0+ACK9gezachNm32oJgLc0baECMhEZBBCLMfZIowhfagtebS2iUfKC2FEHBx2nDnU0nNHaIQKc0uU8TRfj0/4QbQrjJcbj5hHqm2eR6qBNuck/zHJwwWX2p0dNs8N7C6EvB9ocHSdofGnuLDd7jZ3XCDT6nMXbAm3vWZp5ibO556YJwY8+8zbM2wHuLTIIId40VN/buyTzz3tz7w8o7Y8VNvQO2rrkB7/FzySE0b9ewz2LgIrSGMTDP0+C/5Qacicr9JTGEiyVBkmku871chSNMH2dDC2TYqLK9WBJgNjH3/gdOGMAR7kDoMQBi9t1iyeDzpbkf+xzN0fC74LB6BkK4Y33Od1Tf1C+0KvmUGCGAk5o7fE3BUk3u6gdOI+QmpADvHYMQWrOJAY9qVA/VBZtrQmsnC0C4vTRgGuR9i8xP9ELcjBAhSKKxBvdU+QZi7upneknylAjgFpCT7ix/1HcD9WHhoZpgC0ZIPQdxUqtnU+V33vZXek0CESOCOGk6/Wjls16EuczP64C08JEA4FsQEy62v4acX3TWAd+veii5dPoUhNAc2zPl8W6XzUP1dNrHDrgF1LKvhqHXoen3joCKEXu4CZ+DZNJ0dv3jzm6ae/93F0DFinPMhEAmXA9Dl99UyPxIO4SgmWwwl31AEz5f/7xjW/OLKx4BPwXbOB8/sv0DNjddNNruVsTpp0AtqYOTOhT9D05FYjUSMebTR2CvEq22bIbWzqN+8sHTjIiv7j8DMqF5r7aq5ZmMtUabfCi+AEozjk66cjCc+9APBIittdkC4nNx0uU7qCAeaiJiacHBWm7FSe2ZVJVxfxHUQ3VxNAZEoIY07eaklLEPVtoYvxy6itiPvGYABuHqGdSKtPbbudH2kNCP+HARaNOk29D137rKXbk12l6IdKRWBAdc3zgt6fpvYB5qiOtHGItvwV8bPnYqhoY8Gm1PxOjSzSNwwNVDtjWdyqEIaS6qY/C3afAXv9f3vqvy7UXdJNeiAHwBdNlkmNCtVOiqhjSigjhDn1LB9hOmCd1KhaFJWCMqKRV1B/cOtA5q2vX5V8MbUQnGAUoz3kuHsaCvCSlqJoRGVIo/OjM+PQ714xJLF79umoc3omZGNNW/+utuKAsGMCFF1WAQaUGowfPNZ7LQ/0eYKPRJpIZCVwxdMg1ZG+c1WYkU7ua3CupaaAoi2Wji5H4vfMqZDjgjE9z8DtzPeLYzSxpAJBtIxupAsBYX/vkvQE91OEN0VD1ke7rMKMgz4Lw679HyypfL3fwBlFE9NhVrCtuerkLKdG0a3JLTnpJebN/szb9BGtPd4L9g9RHWT3VGQe4PTgOUj3m1NhHseBrir48Dl40glcJUHTKfLkNyCqW7w86rp4M+52A9UwIdtGxkA6YZXVUkRjQoOVmW+7Na73Q6ndd1zafV015tMFH+jwed/vGb/wb0VLBfWeuhCMUVTEGQdR5O/w9ZcHFMm25+3w6ACOKjmsJvMtBL6PuXDTAfVVXnYoTICb/57IUrAHnUFMpQhJdfg5MN1K6tCUlVRCbZs8FxuajwE9wuA7UE+j+uiNlAWwoHweyG0UspGy67jTBBqKs+iRWi0uBsOzY4FY8jYB/N4XtwpHLeFwNXwmVNAxZlXFL2xbbdxnHgHUUiEO1lA7zUr6kap8qvSikbWZSAauWPGSLH/WEFY/Yx5K8aa4hy3BCtfXFlGwFgDK242BdXtgMezPgixqxomA0OMkAlo8YOUd1tZNEBqsca8epuaM1TkcTgAnEWqzZckTxBPSAxiBeiHMErH704VY1obtXjk1I5IaKhyPkkHp6K/kLd0iAOnoo+xyzrlCNdNrhoQtDSnHDZiNJDTfVItqnyDMcLAuQSDodtsLxHJBo5PAbUNSeQVAUa70s61T5eRmSjOgA6pfG5KidPSLyXW69hCkdO7pP6GYd5TcDAKNMQ8zkIGOVoGTlZJsmnql6jo8s56uwRWTxN894kGkMK8oTcz6isqTrwG6kAFifIA1K/MOIobWQLGaSCRzS9uKha6yOBVGepamR+W8RfU2hIbVSsGj/zWapPaxPfOSd3OtV6ccYzVFf8VVCnnwDgFDoh2JxfXDSv1j5OaNmfU5sHE/qzWjVBdAvNp6e1WV8whthUWVwKmDbg1p8NetV5AjzTQ/W6Ook4+DibTSZ99R3qfr8/mX2s1Xqn0aP9D7uQ9GyzEGMNAAAAAElFTkSuQmCC"
              alt="Google"
            />
          </a>
        </div>
        <div className="signup-prompt">
          아직 OO Member가 아니신가요? <a href="/signup">회원가입</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
