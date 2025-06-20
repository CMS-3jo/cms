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
  
  // 사용자 추가 폼 상태
  const [userForm, setUserForm] = useState({
    userId: "",
    password: "",
    roleType: "STUDENT",
    name: "",
    deptCode: "",
    phoneNumber: "",
    email: "",
    postalCode: "",
    address: "",
    detailAddress: "",
    studentNo: "",
    gradeYear: 1,
    enterDate: "",
    employeeNo: "",
    statusCode: "ACTIVE"
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

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
    if (modalType === "add-user") {
      // 사용자 추가 모달 열 때 폼 초기화
      resetUserForm();
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setDetailContent("");
    setSubmitError("");
    setSubmitSuccess("");
  };

  // 사용자 추가 폼 초기화
  const resetUserForm = () => {
    setUserForm({
      userId: "",
      password: "",
      roleType: "STUDENT",
      name: "",
      deptCode: "",
      phoneNumber: "",
      email: "",
      postalCode: "",
      address: "",
      detailAddress: "",
      studentNo: "",
      gradeYear: 1,
      enterDate: "",
      employeeNo: "",
      statusCode: "ACTIVE"
    });
    setSubmitError("");
    setSubmitSuccess("");
  };

  // 폼 입력 핸들러
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 역할 변경 시 필드 초기화
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setUserForm(prev => ({
      ...prev,
      roleType: newRole,
      studentNo: "",
      gradeYear: 1,
      enterDate: "",
      employeeNo: ""
    }));
  };

  // 사용자 추가 제출
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      // 역할별 필수 필드 검증
      if (userForm.roleType === "STUDENT" && !userForm.studentNo) {
        throw new Error("학번은 필수입니다.");
      }
      if (userForm.roleType !== "STUDENT" && !userForm.employeeNo) {
        throw new Error("사번은 필수입니다.");
      }

      const requestData = {
        userId: userForm.userId,
        password: userForm.password,
        roleType: userForm.roleType,
        name: userForm.name,
        deptCode: userForm.deptCode,
        phoneNumber: userForm.phoneNumber,
        email: userForm.email,
        postalCode: userForm.postalCode,
        address: userForm.address,
        detailAddress: userForm.detailAddress,
        statusCode: userForm.statusCode
      };

      // 역할별 필드 추가
      if (userForm.roleType === "STUDENT") {
        requestData.studentNo = userForm.studentNo;
        requestData.gradeYear = parseInt(userForm.gradeYear);
        if (userForm.enterDate) {
          requestData.enterDate = userForm.enterDate + "T00:00:00";
        }
      } else {
        requestData.employeeNo = userForm.employeeNo;
      }

      const response = await apiCall(
        "http://localhost:8082/api/auth/users/registered",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitSuccess(`${getUserTypeLabel(userForm.roleType)} "${result.name}" 생성이 완료되었습니다.`);
        resetUserForm();
      } else {
        setSubmitError(result.message || "사용자 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("사용자 생성 실패:", err);
      setSubmitError(err.message || "사용자 생성에 실패했습니다.");
    } finally {
      setSubmitLoading(false);
    }
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

            {/* 관리자 전용 - 사용자 추가 카드 */}
            {userProfile.userType === "ADMIN" && (
              <div
                className="menu-card admin-card"
                onClick={() => openModal("add-user")}
              >
                <div className="menu-icon">➕</div>
                <h3>사용자 추가</h3>
                <p>학생, 교수, 상담사, 관리자 계정 생성</p>
                <div className="menu-arrow">→</div>
              </div>
            )}

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
                  {activeModal === "add-user" && "➕ 사용자 추가"}
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

                {activeModal === "add-user" && (
                  <div className="user-form-container">
                    {submitSuccess && (
                      <div className="alert alert-success" role="alert">
                        {submitSuccess}
                      </div>
                    )}
                    
                    {submitError && (
                      <div className="alert alert-danger" role="alert">
                        {submitError}
                      </div>
                    )}

                    <form onSubmit={handleSubmitUser} className="user-form">
                      {/* 기본 계정 정보 */}
                      <div className="form-section">
                        <h4>기본 계정 정보</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="userId">사용자 ID <span className="required">*</span></label>
                            <input
                              type="text"
                              id="userId"
                              name="userId"
                              value={userForm.userId}
                              onChange={handleFormChange}
                              required
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="password">비밀번호 <span className="required">*</span></label>
                            <input
                              type="password"
                              id="password"
                              name="password"
                              value={userForm.password}
                              onChange={handleFormChange}
                              required
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="roleType">역할 <span className="required">*</span></label>
                            <select
                              id="roleType"
                              name="roleType"
                              value={userForm.roleType}
                              onChange={handleRoleChange}
                              required
                              className="form-control"
                            >
                              <option value="STUDENT">학생</option>
                              <option value="PROFESSOR">교수</option>
                              <option value="COUNSELOR">상담사</option>
                              <option value="ADMIN">관리자</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label htmlFor="name">이름 <span className="required">*</span></label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={userForm.name}
                              onChange={handleFormChange}
                              required
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 역할별 필수 정보 */}
                      <div className="form-section">
                        <h4>역할별 정보</h4>
                        {userForm.roleType === "STUDENT" ? (
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="studentNo">학번 <span className="required">*</span></label>
                              <input
                                type="text"
                                id="studentNo"
                                name="studentNo"
                                value={userForm.studentNo}
                                onChange={handleFormChange}
                                required
                                className="form-control"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="gradeYear">학년</label>
                              <select
                                id="gradeYear"
                                name="gradeYear"
                                value={userForm.gradeYear}
                                onChange={handleFormChange}
                                className="form-control"
                              >
                                <option value={1}>1학년</option>
                                <option value={2}>2학년</option>
                                <option value={3}>3학년</option>
                                <option value={4}>4학년</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="employeeNo">사번 <span className="required">*</span></label>
                              <input
                                type="text"
                                id="employeeNo"
                                name="employeeNo"
                                value={userForm.employeeNo}
                                onChange={handleFormChange}
                                required
                                className="form-control"
                              />
                            </div>
                          </div>
                        )}

                        {userForm.roleType === "STUDENT" && (
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="enterDate">입학일</label>
                              <input
                                type="date"
                                id="enterDate"
                                name="enterDate"
                                value={userForm.enterDate}
                                onChange={handleFormChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        )}

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="deptCode">학과코드 <span className="required">*</span></label>
                            <input
                              type="text"
                              id="deptCode"
                              name="deptCode"
                              value={userForm.deptCode}
                              onChange={handleFormChange}
                              required
                              className="form-control"
                              placeholder="예: COMP001"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 연락처 정보 */}
                      <div className="form-section">
                        <h4>연락처 정보</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="email">이메일</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={userForm.email}
                              onChange={handleFormChange}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="phoneNumber">전화번호</label>
                            <input
                              type="tel"
                              id="phoneNumber"
                              name="phoneNumber"
                              value={userForm.phoneNumber}
                              onChange={handleFormChange}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="postalCode">우편번호</label>
                            <input
                              type="text"
                              id="postalCode"
                              name="postalCode"
                              value={userForm.postalCode}
                              onChange={handleFormChange}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group full-width">
                            <label htmlFor="address">주소</label>
                            <input
                              type="text"
                              id="address"
                              name="address"
                              value={userForm.address}
                              onChange={handleFormChange}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group full-width">
                            <label htmlFor="detailAddress">상세주소</label>
                            <input
                              type="text"
                              id="detailAddress"
                              name="detailAddress"
                              value={userForm.detailAddress}
                              onChange={handleFormChange}
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 버튼 */}
                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={resetUserForm}
                          className="btn btn-secondary"
                          disabled={submitLoading}
                        >
                          초기화
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={submitLoading}
                        >
                          {submitLoading ? "생성 중..." : "사용자 생성"}
                        </button>
                      </div>
                    </form>
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