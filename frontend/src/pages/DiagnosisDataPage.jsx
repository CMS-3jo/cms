// src/pages/DiagnosisDataPage.jsx
import React from 'react';

const DiagnosisDataPage = () => {
  // 샘플 데이터
  const sampleData = [
    {
      responseTime: "2025-06-10 14:30:25",
      answers: [3, 2, 4, 1, 5, 2, 3, 4, 2, 1]
    },
    {
      responseTime: "2025-06-09 10:15:42",
      answers: [2, 3, 2, 4, 3, 1, 2, 3, 4, 2]
    },
    {
      responseTime: "2025-06-08 16:45:18",
      answers: [4, 1, 3, 2, 4, 3, 1, 2, 3, 4]
    }
  ];

  const bodyStyle = {
    fontFamily: 'Arial, sans-serif',
    margin: '20px',
    padding: 0
  };

  const h1Style = {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px'
  };

  const tableStyle = {
    margin: '0 auto',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    borderCollapse: 'collapse'
  };

  const thStyle = {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'center',
    border: '1px solid #ddd',
    fontWeight: 'bold'
  };

  const tdStyle = {
    padding: '10px',
    textAlign: 'center',
    border: '1px solid #ddd'
  };

  return (
    <div style={bodyStyle}>
      <h1 style={h1Style}>자가진단 결과</h1>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>응답 시간</th>
            <th style={thStyle}>문항 1</th>
            <th style={thStyle}>문항 2</th>
            <th style={thStyle}>문항 3</th>
            <th style={thStyle}>문항 4</th>
            <th style={thStyle}>문항 5</th>
            <th style={thStyle}>문항 6</th>
            <th style={thStyle}>문항 7</th>
            <th style={thStyle}>문항 8</th>
            <th style={thStyle}>문항 9</th>
            <th style={thStyle}>문항 10</th>
          </tr>
        </thead>
        <tbody>
          {sampleData.map((data, index) => (
            <tr key={index} style={index % 2 === 0 ? {backgroundColor: '#f9f9f9'} : {}}>
              <td style={tdStyle}>{data.responseTime}</td>
              {data.answers.map((answer, answerIndex) => (
                <td key={answerIndex} style={tdStyle}>{answer}</td>
              ))}
            </tr>
          ))}
          <tr>
            <td colSpan="11" style={tdStyle}>데이터</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DiagnosisDataPage;