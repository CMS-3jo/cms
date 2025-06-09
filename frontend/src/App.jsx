// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import CounselingListPage from './pages/CounselingListPage';
import CounselingDetailPage from './pages/CounselingDetailPage';
import CounselingRecordPage from './pages/CounselingRecordPage';
import MonthlyCalendarPage from './pages/MonthlyCalendarPage';
import WeeklyCalendarPage from './pages/WeeklyCalendarPage';

// CSS 파일들은 index.html에서 링크로 불러옵니다

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/counseling/applications" replace />} />
            <Route path="/counseling/applications" element={<CounselingListPage />} />
            <Route path="/counseling/applications/:id" element={<CounselingDetailPage />} />
            <Route path="/counseling/records/write/:id" element={<CounselingRecordPage />} />
            <Route path="/counseling/monthly" element={<MonthlyCalendarPage />} />
            <Route path="/counseling/weekly" element={<WeeklyCalendarPage />} />
            {/* 추가 라우트들 */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;