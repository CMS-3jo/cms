// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.jsx";

// 기존 관리자 페이지들
import CounselingListPage from "./pages/CounselingListPage";
import CounselingDetailPage from "./pages/CounselingDetailPage";
import CounselingRecordPage from "./pages/CounselingRecordPage";
import MonthlyCalendarPage from "./pages/MonthlyCalendarPage";
import WeeklyCalendarPage from "./pages/WeeklyCalendarPage";

// 기존 퍼블릭 페이지들
import MainHomePage from "./pages/MainHomePage";
import CounselingApplyPage from "./pages/CounselingApplyPage";
import SelfDiagnosisPage from "./pages/SelfDiagnosisPage";
import DiagnosisResultPage from "./pages/DiagnosisResultPage";
import DiagnosisDataPage from "./pages/DiagnosisDataPage";
import MyPage from "./pages/MyPage";
import CenterIntroPage from "./pages/CenterIntroPage";
import NoncurricularListPage from "./pages/NoncurricularListPage.jsx";
import NoncurricularEditPage from "./pages/NoncurricularEditPage.jsx";

// 새로 추가된 상담 페이지들
import PsychologicalCounselingPage from "./pages/PsychologicalCounselingPage";
import AnonymousCounselingPage from "./pages/AnonymousCounselingPage";
import CrisisCounselingPage from "./pages/CrisisCounselingPage";
import CareerCounselingPage from "./pages/CareerCounselingPage";
import EmploymentCounselingPage from "./pages/EmploymentCounselingPage";
import ProfessorCounselingPage from "./pages/ProfessorCounselingPage";
import AcademicConsultingPage from "./pages/AcademicConsultingPage";
import PeerCounselingPage from "./pages/PeerCounselingPage";
import NoncurricularViewPage from "./pages/NoncurricularViewPage.jsx";
import NoncurricularRegisterPage from "./pages/NoncurricularRegisterPage.jsx";
import CounselorChatListPage from './pages/CounselorChatList';


// 핵심역량 관련 페이지들
import CCARegPage from "./pages/CCA_RegPage.jsx";
import CCAViewPage from "./pages/CCA_ListPage.jsx";
import CCASurveyPage from "./pages/CCA_SurveyPage.jsx";
import CCAAnalysisPage from "./pages/CCA_AnalysisPage.jsx";
import CCAResultPage from "./pages/CCA_ResultPage.jsx";
import ChatModalRoute from "./pages/ChatModalRoute.jsx";
import NoncurAdminPage from './pages/NoncurAdminPage';

//공지사항 관련 페이지
import NoticeListPage from "./pages/NoticeListPage.jsx";
import NoticeDetailPage from "./pages/NoticeDetailPage.jsx";
import NoticeWritePage from "./pages/NoticeWritePage.jsx";
import NoticeEditPage from "./pages/NoticeEditPage.jsx";

//로그인 페이지
import LoginPage from "./pages/LoginPage";
import OAuthCallbackPage from './pages/OAuthCallbackPage.jsx';


function App() {
  return (
    <AuthProvider>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <div className="App">
          <Routes>
            {/* 메인 페이지 - 루트 경로 */}
            <Route path="/" element={<MainHomePage />} />
            <Route path="/home" element={<MainHomePage />} />

            {/* 로그인 페이지 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />

            {/* 퍼블릭 페이지들 */}
            <Route path="/cnsl/apply/:parentCd" element={<CounselingApplyPage />} />
            <Route path="/self-diagnosis" element={<SelfDiagnosisPage />} />
            <Route path="/diagnosis-result" element={<DiagnosisResultPage />} />
            <Route path="/diagnosis-data" element={<DiagnosisDataPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route
              path="/center-intro"
              element={<CenterIntroPage activeTab="intro" />}
            />
            <Route
              path="/center-intro/business"
              element={<CenterIntroPage activeTab="business" />}
            />
            <Route
              path="/center-intro/organization"
              element={<CenterIntroPage activeTab="organization" />}
            />
            <Route
              path="/center-intro/location"
              element={<CenterIntroPage activeTab="location" />}
            />


            {/* 비교과 프로그램*/}
            {/* 비교과 페이지 */}
            <Route path="/noncur" element={<NoncurricularListPage />} />
            <Route path="/noncur/:prgId" element={<NoncurricularViewPage />} />
            <Route path="/noncur/register" element={<NoncurricularRegisterPage />} />
            <Route path="/noncur/:prgId/edit" element={<NoncurricularEditPage />} />  

            {/* 비교과 관리자 페이지 */}
            <Route path="/admin/noncur" element={<NoncurAdminPage />} />
            <Route path="/admin/noncur/program/:prgId" element={<NoncurAdminPage />} />




            {/* 심리상담 관련 페이지들 */}
            <Route
              path="/cnsl/psychological"
              element={<PsychologicalCounselingPage />}
            />
            <Route path="/cnsl/anonymous" element={<AnonymousCounselingPage />} />
            <Route path="/cnsl/crisis" element={<CrisisCounselingPage />} />

            {/* 학업상담 관련 페이지들 */}
            <Route path="/cnsl/career" element={<CareerCounselingPage />} />
            <Route path="/cnsl/employment" element={<EmploymentCounselingPage />} />
            <Route path="/cnsl/professor" element={<ProfessorCounselingPage />} />
            <Route path="/cnsl/academic" element={<AcademicConsultingPage />} />

            {/* 핵심역량 */}
            {/* 학생용 페이지 */}
            <Route path="/cca/list" element={<CCAViewPage />} />
            <Route path="/cca/survey/:cciId" element={<CCASurveyPage />} />
            <Route path="/cca/result" element={<CCAResultPage />} />
            {/* 상담사용 페이지 */}
            <Route path="/cca/register" element={<CCARegPage />} />
            <Route path="/cca/analysis" element={<CCAAnalysisPage />} />

            {/* 공지사항 */}
            <Route path="/notices" element={<NoticeListPage />} />
            <Route path="/notices/new" element={<NoticeWritePage />} />
            <Route path="/notices/:id/edit" element={<NoticeEditPage />} />
            <Route path="/notices/:id" element={<NoticeDetailPage />} />

            {/* 기타상담 */}
            <Route path="/peer" element={<PeerCounselingPage />} />

            {/* 채팅 */}
            <Route path="/user/chatbot" element={<ChatModalRoute />} />
			<Route path="/counselor/chat/list" element={<CounselorChatListPage />} />

            {/* 관리자 페이지들 */}
            <Route path="/admin/counseling" element={<CounselingListPage />} />
            <Route path="/admin/counseling/:id"
              element={<CounselingDetailPage />}
            />
            <Route
              path="/admin/counseling/records/write/:id"
              element={<CounselingRecordPage />}
            />
            <Route
              path="/admin/calendar/monthly"
              element={<MonthlyCalendarPage />}
            />
            <Route
              path="/admin/calendar/weekly"
              element={<WeeklyCalendarPage />}
            />
          </Routes>

          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;