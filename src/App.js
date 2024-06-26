import './App.css';

import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrderPage from './pages/OrderPage';
import ChartPage from './pages/chartPage';
import MyPage from './pages/MyPage';
import Header from './components/header';
import ChatPage from './components/Chatting.js';
import SimpleHeader from './components/headerSimple';
import { ChatProvider } from './components/ChatContext';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  let location = useLocation();
  let isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      <ChatProvider>
        {isAuthPage ? <SimpleHeader /> : <Header />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/company/:companyId" element={<ChartPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </ChatProvider>
    </>
  );
}

export default AppWrapper;
