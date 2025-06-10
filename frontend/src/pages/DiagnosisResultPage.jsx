// src/pages/DiagnosisResultPage.jsx
import React from 'react';

const DiagnosisResultPage = () => {
  const score = 25; // 예시 점수
  const result = "보통"; // 예시 결과

  const getResultIcon = (result) => {
    switch(result) {
      case "위험":
        return <i className="fas fa-exclamation-circle" style={{color: '#e57373'}}>위험</i>;
      case "주의":
        return <i className="fas fa-exclamation-triangle" style={{color: '#ffeb3b'}}>주의</i>;
      case "보통":
        return <i className="fas fa-info-circle" style={{color: '#ffa726'}}>보통</i>;
      case "정상":
        return <i className="fas fa-smile" style={{color: '#26c6da'}}>정상</i>;
      default:
        return <i className="fas fa-info-circle" style={{color: '#ffa726'}}>보통</i>;
    }
  };

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  const handleMyPageClick = () => {
    window.location.href = '/mypage';
  };

  const bodyStyle = {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f4',
    margin: 0,
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  };

  const getContainerStyle = (result) => {
    let backgroundColor = 'white';
    let borderLeft = '';
    
    switch(result) {
      case "위험":
        backgroundColor = '#ffebee';
        borderLeft = '6px solid #e57373';
        break;
      case "주의":
        backgroundColor = '#fffde7';
        borderLeft = '6px solid #ffeb3b';
        break;
      case "보통":
        backgroundColor = '#fff3e0';
        borderLeft = '6px solid #ffa726';
        break;
      case "정상":
        backgroundColor = '#e0f7fa';
        borderLeft = '6px solid #26c6da';
        break;
      default:
        backgroundColor = '#fff3e0';
        borderLeft = '6px solid #ffa726';
    }

    return {
      backgroundColor,
      borderLeft,
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      maxWidth: '400px',
      textAlign: 'center'
    };
  };

  const iconStyle = {
    fontSize: '50px',
    marginBottom: '15px'
  };

  const h1Style = {
    fontSize: '28px',
    marginBottom: '20px'
  };

  const pStyle = {
    fontSize: '18px',
    marginBottom: '10px'
  };

  const buttonContainerStyle = {
    marginTop: '20px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    margin: '5px',
    transition: 'background-color 0.3s'
  };

  return (
    <div style={bodyStyle}>
      <div style={getContainerStyle(result)}>
        <div style={iconStyle}>
          <i className="fas fa-exclamation-circle" style={{color: '#e57373'}}>위험</i>
          <i className="fas fa-exclamation-triangle" style={{color: '#ffeb3b'}}>주의</i>
          <i className="fas fa-info-circle" style={{color: '#ffa726'}}>보통</i>
          <i className="fas fa-smile" style={{color: '#26c6da'}}>정상</i>
        </div>
        <h1 style={h1Style}>자가진단 결과</h1>
        <p style={pStyle}>총점: <span>{score} 점</span></p>
        <p style={pStyle}>결과: <span>{getResultIcon(result)}</span></p>
        <div style={buttonContainerStyle}>
          <button 
            style={buttonStyle}
            onClick={handleHomeClick}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            홈으로 이동
          </button>
          <button 
            style={buttonStyle}
            onClick={handleMyPageClick}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            마이페이지로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResultPage;