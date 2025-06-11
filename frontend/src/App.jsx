// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';


// 기존 관리자 페이지들
import CounselingListPage from './pages/CounselingListPage';
import CounselingDetailPage from './pages/CounselingDetailPage';
import CounselingRecordPage from './pages/CounselingRecordPage';
import MonthlyCalendarPage from './pages/MonthlyCalendarPage';
import WeeklyCalendarPage from './pages/WeeklyCalendarPage';

// 기존 퍼블릭 페이지들
import MainHomePage from './pages/MainHomePage';
import CounselingApplyPage from './pages/CounselingApplyPage';
import SelfDiagnosisPage from './pages/SelfDiagnosisPage';
import DiagnosisResultPage from './pages/DiagnosisResultPage';
import DiagnosisDataPage from './pages/DiagnosisDataPage';
import MyPage from './pages/MyPage';
import CenterIntroPage from './pages/CenterIntroPage';
import NoncurricularListPage from './pages/NoncurricularListPage.jsx';



// 새로 추가된 상담 페이지들
import PsychologicalCounselingPage from './pages/PsychologicalCounselingPage';
import AnonymousCounselingPage from './pages/AnonymousCounselingPage';
import CrisisCounselingPage from './pages/CrisisCounselingPage';
import CareerCounselingPage from './pages/CareerCounselingPage';
import EmploymentCounselingPage from './pages/EmploymentCounselingPage';
import ProfessorCounselingPage from './pages/ProfessorCounselingPage';
import AcademicConsultingPage from './pages/AcademicConsultingPage';
import PeerCounselingPage from './pages/PeerCounselingPage';
import NoncurricularViewPage from './pages/NoncurricularViewPage.jsx';
import NoncurricularRegisterPage from './pages/NoncurricularRegisterPage.jsx';
import ChatModal from './pages/ChatModal.jsx';

function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="App">
        <Routes>
          {/* 퍼블릭 페이지들 */}
          <Route path="/" element={<MainHomePage />} />
          <Route path="/home" element={<MainHomePage />} />
          <Route path="/apply" element={<CounselingApplyPage />} />
          <Route path="/self-diagnosis" element={<SelfDiagnosisPage />} />
          <Route path="/diagnosis-result" element={<DiagnosisResultPage />} />
          <Route path="/diagnosis-data" element={<DiagnosisDataPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/center-intro" element={<CenterIntroPage activeTab="intro" />} />
          <Route path="/center-intro/business" element={<CenterIntroPage activeTab="business" />} />
          <Route path="/center-intro/organization" element={<CenterIntroPage activeTab="organization" />} />
          <Route path="/center-intro/location" element={<CenterIntroPage activeTab="location" />} />
          <Route path="/noncur/list" element={<NoncurricularListPage/>} />
          <Route path="/noncur/view" element={<NoncurricularViewPage/>} />
          <Route path="/noncur/reg" element={<NoncurricularRegisterPage/>} />

          {/* 심리상담 관련 페이지들 */}
          <Route path="/psychological" element={<PsychologicalCounselingPage />} />
          <Route path="/anonymous" element={<AnonymousCounselingPage />} />
          <Route path="/crisis" element={<CrisisCounselingPage />} />

          {/* 학업상담 관련 페이지들 */}
          <Route path="/career" element={<CareerCounselingPage />} />
          <Route path="/employment" element={<EmploymentCounselingPage />} />
          <Route path="/professor" element={<ProfessorCounselingPage />} />
          <Route path="/academic" element={<AcademicConsultingPage />} />

          {/* 기타상담 */}
          <Route path="/peer" element={<PeerCounselingPage />} />
          
		  {/* 채팅 */}
          <Route path="/user/chatbot" element={<ChatModal />} />

          {/* 관리자 페이지들 */}
          <Route path="/admin/counseling" element={<CounselingListPage />} />
          <Route path="/admin/counseling/:id" element={<CounselingDetailPage />} />
          <Route path="/admin/counseling/record/:id" element={<CounselingRecordPage />} />
          <Route path="/admin/calendar/monthly" element={<MonthlyCalendarPage />} />
          <Route path="/admin/calendar/weekly" element={<WeeklyCalendarPage />} />
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;

