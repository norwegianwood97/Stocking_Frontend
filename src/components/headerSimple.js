import React from 'react';
import './headerSimple.css';
import logoImage from '../assets/logo.png';

const SimpleHeader = () => {
  return (
    <header className="header">
      <div className="header-center">
        <img src={logoImage} alt="Logo" />
      </div>
    </header>
  );
};

export default SimpleHeader;
