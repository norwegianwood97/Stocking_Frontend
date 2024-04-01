import './App.css';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage.js';
import OrderPage from './pages/OrderPage.js';
import ChartPage from './pages/chartPage.js';
import Icon from './components/Icon.js';
function App() {
  return (
    <Router>
      <Icon type="MainPage" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chart" element={<ChartPage />} />
      </Routes>
    </Router>
  );
}

export default App;
