import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";
import Footer from "../components/layout/Footer";
import "../../public/css/MyPage.css";

const MyPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [detailContent, setDetailContent] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, apiCall, checkCurrentUser } = useAuth();
  const navigate = useNavigate();

  // 사용자 프로필 정보 조회
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await apiCall(
          "http://localhost:8082/api/mypage/profile",
          {
            method: "GET",
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserProfile(result.data);
          } else {
            setError(
              result.message || "프로필 정보를 불러오는데 실패했습니다."
            );
          }
        } else {
          setError("프로필 정보를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("프로필 조회 실패:", err);
        setError("프로필 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, apiCall]);

  // 사용자 타입별 라벨 반환
  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case "STUDENT":
        return "학생";
      case "PROFESSOR":
        return "교수";
      case "COUNSELOR":
        return "상담사";
      case "ADMIN":
        return "관리자";
      case "GUEST":
        return "게스트";
      default:
        return "사용자";
    }
  };

  // 모달 관련 함수들
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
    setDetailContent("");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    const handleModalClick = (event) => {
      if (event.target.classList.contains("modal")) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleModalClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleModalClick);
    };
  }, [activeModal]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="mypage-body">
        <PublicHeader />
        <main>
          <div className="container_layout mypage-container">
            <div className="loading-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">프로필 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="mypage-body">
        <PublicHeader />
        <main>
          <div className="container_layout mypage-container">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">오류 발생</h4>
              <p>{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                다시 시도
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 프로필 정보가 없는 경우
  if (!userProfile) {
    return (
      <div className="mypage-body">
        <PublicHeader />
        <main>
          <div className="container_layout mypage-container">
            <div className="alert alert-warning" role="alert">
              프로필 정보를 찾을 수 없습니다.
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <PublicHeader />
      <main>
        <div className="container_layout">
          {/* 프로필 헤더 */}
          <div className="profile-header-new">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {userProfile.profileImageUrl ? (
                  <img
                    src={userProfile.profileImageUrl}
                    alt="프로필 이미지"
                    className="avatar-image"
                  />
                ) : (
                  <span className="avatar-text">
                    {userProfile.userName?.charAt(0) || "U"}
                  </span>
                )}
              </div>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {userProfile.userName || "이름 없음"}
                <span className="profile-badge">
                  {getUserTypeLabel(userProfile.userType)}
                </span>
              </h1>
              <div className="profile-details">
                <div className="profile-item">
                  <span className="profile-icon">🆔</span>
                  <span>{userProfile.identifierNo || userProfile.userId}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-icon">🎓</span>
                  <span>
                    {userProfile.deptName || "소속 없음"}
                    {userProfile.gradeYear && ` ${userProfile.gradeYear}학년`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 메뉴 카드들 */}
          <div className="menu-cards-grid">
            {/* 개인정보 카드 */}
            <div
              className="menu-card"
              onClick={() => openModal("personal-info")}
            >
              <div className="menu-icon">👤</div>
              <h3>개인정보</h3>
              <p>연락처 및 주소 정보 확인</p>
              <div className="menu-arrow">→</div>
            </div>

            {/* 상담 내용 카드 */}
            {(userProfile.userType === "STUDENT" ||
              userProfile.userType === "PROFESSOR" ||
              userProfile.userType === "COUNSELOR") && (
              <div className="menu-card">
                <div className="menu-icon">💬</div>
                <h3>나의 상담활동</h3>
                <p>상담 기록 및 내용 확인</p>
                <div className="menu-arrow">→</div>
              </div>
            )}
          </div>

          {userProfile.userType === "STUDENT" && userProfile.gradeYear && (
            <div className="menu-cards-grid">
              {/* 검사 기록 카드 */}
              <div
                className="menu-card"
                onClick={() => navigate("/cca/result")}
              >
                <div className="menu-icon">📊</div>
                <h3>나의 검사기록</h3>
                <p>심리검사 결과 및 점수 확인</p>
                <div className="menu-arrow">→</div>
              </div>

              {/* 비교과 카드 */}
              <div className="menu-card" onClick={() => navigate("/noncur")}>
                <div className="menu-icon">🎓</div>
                <h3>나의 비교과</h3>
                <p>비교과 활동 확인</p>
                <div className="menu-arrow">→</div>
              </div>
            </div>
          )}

          {/* 모달 */}
          <div
            className={`modal ${activeModal ? "show-modal" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content-new">
              <div className="modal-header-new">
                <h2>
                  {activeModal === "personal-info" && "👤 개인정보"}
                  {activeModal === "detail" && "📋 상담내용 상세보기"}
                </h2>
                <button
                  className="close-button-new"
                  onClick={activeModal === "detail" ? null : closeModal}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body-new">
                {activeModal === "personal-info" && (
                  <div className="info-cards">
                    <div className="info-card">
                      <h3>기본 정보</h3>

                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">이름</span>
                          <span className="info-value">
                            {userProfile.userName || "정보 없음"}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">사용자 ID</span>
                          <span className="info-value">
                            {userProfile.userId}
                          </span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">
                            {userProfile.userType === "STUDENT"
                              ? "학번"
                              : "사번"}
                          </span>
                          <span className="info-value">
                            {userProfile.identifierNo || "정보 없음"}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">소속</span>
                          <span className="info-value">
                            {userProfile.deptName || "정보 없음"}
                          </span>
                        </div>
                        {userProfile.userType === "STUDENT" &&
                          userProfile.gradeYear && (
                            <div className="info-item">
                              <span className="info-label">학년</span>
                              <span className="info-value">
                                {userProfile.gradeYear}학년
                              </span>
                            </div>
                          )}
                        {userProfile.enterDate && (
                          <div className="info-item">
                            <span className="info-label">입학일</span>
                            <span className="info-value">
                              {new Date(
                                userProfile.enterDate
                              ).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="info-card">
                      <h3>연락처 정보</h3>

                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">이메일</span>
                          <span className="info-value">
                            {userProfile.email || "정보 없음"}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">전화번호</span>
                          <span className="info-value">
                            {userProfile.phoneNumber || "정보 없음"}
                          </span>
                        </div>
                        {(userProfile.postalCode || userProfile.address) && (
                          <div className="info-item full-width">
                            <span className="info-label">주소</span>
                            <span className="info-value">
                              {userProfile.postalCode &&
                                `(${userProfile.postalCode}) `}
                              {userProfile.address || "정보 없음"}
                              {userProfile.detailAddress && (
                                <>
                                  <br />
                                  {userProfile.detailAddress}
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 게스트 사용자 추가 정보 */}
                    {userProfile.userType === "GUEST" && (
                      <div className="info-card">
                        <h3>소셜 로그인 정보</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">로그인 제공업체</span>
                            <span className="info-value">
                              {userProfile.provider || "정보 없음"}
                            </span>
                          </div>
                          {userProfile.lastLoginDate && (
                            <div className="info-item">
                              <span className="info-label">마지막 로그인</span>
                              <span className="info-value">
                                {new Date(
                                  userProfile.lastLoginDate
                                ).toLocaleString("ko-KR")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MyPage;
