import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

export default function Home() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear authentication token
    localStorage.removeItem('authToken');
    navigate('/signin');
  };
  return (
    <div className="home-container">      <div className="header">
        <h2 className="app-name">OTP Auth App</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="dashboard">
        <div className="welcome-card">
          <h1 className="welcome-title">Welcome to your Dashboard</h1>
          <p className="welcome-message">
            You have successfully authenticated using OTP verification.
          </p>
        </div>
      </div>
    </div>
  );
}
