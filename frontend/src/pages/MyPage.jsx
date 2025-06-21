import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";
import Footer from "../components/layout/Footer";
import * as XLSX from 'xlsx';
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

  // 엑셀 일괄 추가 상태
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState("");
  const [excelSuccess, setExcelSuccess] = useState("");
  const [bulkResults, setBulkResults] = useState([]);

  // 사용자 리스트 상태
  const [userList, setUserList] = useState([]);
  const [userListLoading, setUserListLoading] = useState(false);
  const [userListError, setUserListError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  // 학과 목록 상태
  const [deptList, setDeptList] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);

  const { user, apiCall } = useAuth();
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

  // 학과 목록 조회
  const fetchDeptList = async () => {
    setDeptLoading(true);
    try {
      const response = await fetch("http://localhost:8082/api/dept");
      if (response.ok) {
        const deptData = await response.json();
        setDeptList(deptData);
      } else {
        console.error("학과 목록 조회 실패");
        setDeptList([]);
      }
    } catch (error) {
      console.error("학과 목록 조회 오류:", error);
      setDeptList([]);
    } finally {
      setDeptLoading(false);
    }
  };

  // 역할별 학과 필터링
  const getFilteredDeptList = () => {
    if (!userForm.roleType) return deptList;
    
    const rolePrefix = {
      'STUDENT': 'S_',
      'PROFESSOR': 'P_', 
      'COUNSELOR': 'C_',
      'ADMIN': 'A_'
    };
    
    const prefix = rolePrefix[userForm.roleType];
    if (!prefix) return deptList;
    
    return deptList.filter(dept => dept.deptCd.startsWith(prefix));
  };

  // 모달 관련 함수들
  const openModal = (modalType) => {
    setActiveModal(modalType);
    if (modalType === "add-user") {
      resetUserForm();
      fetchDeptList(); // 학과 목록 불러오기
    } else if (modalType === "bulk-add-user") {
      resetBulkForm();
    } else if (modalType === "user-list") {
      resetUserListForm();
      fetchUserList();
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setDetailContent("");
    setSubmitError("");
    setSubmitSuccess("");
    resetBulkForm();
    resetUserListForm();
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

  // 엑셀 폼 초기화
  const resetBulkForm = () => {
    setExcelFile(null);
    setExcelData([]);
    setExcelError("");
    setExcelSuccess("");
    setBulkResults([]);
  };

  // 사용자 리스트 폼 초기화
  const resetUserListForm = () => {
    setUserList([]);
    setUserListError("");
    setSearchQuery("");
    setFilterRole("ALL");
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
      deptCode: "", // 역할 변경 시 학과도 초기화
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

  // 엑셀 파일 처리
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setExcelError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return;
    }

    setExcelFile(file);
    setExcelError("");
    setExcelSuccess("");
    setBulkResults([]);

    // 파일 읽기
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setExcelError('엑셀 파일에 데이터가 없습니다.');
          return;
        }

        // 데이터 검증 및 변환
        const processedData = jsonData.map((row, index) => {
          const processedRow = {
            rowNumber: index + 2, // 엑셀에서 헤더 제외한 실제 행 번호
            userId: row['사용자ID'] || row['userId'] || '',
            password: row['비밀번호'] || row['password'] || '',
            roleType: row['역할'] || row['roleType'] || '',
            name: row['이름'] || row['name'] || '',
            deptCode: row['학과코드'] || row['deptCode'] || '',
            phoneNumber: row['전화번호'] || row['phoneNumber'] || '',
            email: row['이메일'] || row['email'] || '',
            postalCode: row['우편번호'] || row['postalCode'] || '',
            address: row['주소'] || row['address'] || '',
            detailAddress: row['상세주소'] || row['detailAddress'] || '',
            studentNo: row['학번'] || row['studentNo'] || '',
            gradeYear: row['학년'] || row['gradeYear'] || 1,
            enterDate: row['입학일'] || row['enterDate'] || '',
            employeeNo: row['사번'] || row['employeeNo'] || '',
            statusCode: row['상태코드'] || row['statusCode'] || 'ACTIVE',
            errors: []
          };

          // 기본 검증
          if (!processedRow.userId) processedRow.errors.push('사용자ID 필수');
          if (!processedRow.password) processedRow.errors.push('비밀번호 필수');
          if (!processedRow.roleType) processedRow.errors.push('역할 필수');
          if (!processedRow.name) processedRow.errors.push('이름 필수');
          if (!processedRow.deptCode) processedRow.errors.push('학과코드 필수');

          // 역할별 검증
          if (processedRow.roleType === 'STUDENT' && !processedRow.studentNo) {
            processedRow.errors.push('학번 필수');
          }
          if (processedRow.roleType !== 'STUDENT' && !processedRow.employeeNo) {
            processedRow.errors.push('사번 필수');
          }

          return processedRow;
        });

        setExcelData(processedData);
        setExcelSuccess(`${processedData.length}개의 데이터를 읽었습니다.`);

      } catch (error) {
        console.error('엑셀 파일 읽기 실패:', error);
        setExcelError('엑셀 파일을 읽는데 실패했습니다.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 엑셀 템플릿 다운로드
  const downloadExcelTemplate = () => {
    const templateData = [
      {
        '사용자ID': 'student001',
        '비밀번호': 'password123',
        '역할': 'STUDENT',
        '이름': '김학생',
        '학과코드': 'COMP001',
        '학번': '2024001',
        '사번': '',
        '학년': 1,
        '입학일': '2024-03-01',
        '전화번호': '010-1234-5678',
        '이메일': 'student@example.com',
        '우편번호': '12345',
        '주소': '서울시 강남구',
        '상세주소': '123번지',
        '상태코드': 'ACTIVE'
      },
      {
        '사용자ID': 'prof001',
        '비밀번호': 'password123',
        '역할': 'PROFESSOR',
        '이름': '김교수',
        '학과코드': 'COMP001',
        '학번': '',
        '사번': 'P2024001',
        '학년': '',
        '입학일': '',
        '전화번호': '010-9876-5432',
        '이메일': 'professor@example.com',
        '우편번호': '54321',
        '주소': '서울시 서초구',
        '상세주소': '456번지',
        '상태코드': 'ACTIVE'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '사용자목록');
    XLSX.writeFile(workbook, '사용자_일괄등록_템플릿.xlsx');
  };

  // 엑셀 데이터 일괄 등록
  const handleBulkSubmit = async () => {
    if (!excelData.length) {
      setExcelError('등록할 데이터가 없습니다.');
      return;
    }

    setExcelLoading(true);
    setExcelError("");
    setExcelSuccess("");
    setBulkResults([]);

    const results = [];

    for (const rowData of excelData) {
      if (rowData.errors.length > 0) {
        results.push({
          rowNumber: rowData.rowNumber,
          userId: rowData.userId,
          name: rowData.name,
          success: false,
          message: `검증 실패: ${rowData.errors.join(', ')}`
        });
        continue;
      }

      try {
        const requestData = {
          userId: rowData.userId,
          password: rowData.password,
          roleType: rowData.roleType,
          name: rowData.name,
          deptCode: rowData.deptCode,
          phoneNumber: rowData.phoneNumber,
          email: rowData.email,
          postalCode: rowData.postalCode,
          address: rowData.address,
          detailAddress: rowData.detailAddress,
          statusCode: rowData.statusCode
        };

        // 역할별 필드 추가
        if (rowData.roleType === "STUDENT") {
          requestData.studentNo = rowData.studentNo;
          requestData.gradeYear = parseInt(rowData.gradeYear) || 1;
          if (rowData.enterDate) {
            requestData.enterDate = rowData.enterDate + "T00:00:00";
          }
        } else {
          requestData.employeeNo = rowData.employeeNo;
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
          results.push({
            rowNumber: rowData.rowNumber,
            userId: rowData.userId,
            name: rowData.name,
            success: true,
            message: "등록 성공"
          });
        } else {
          results.push({
            rowNumber: rowData.rowNumber,
            userId: rowData.userId,
            name: rowData.name,
            success: false,
            message: result.message || "등록 실패"
          });
        }

      } catch (error) {
        results.push({
          rowNumber: rowData.rowNumber,
          userId: rowData.userId,
          name: rowData.name,
          success: false,
          message: `오류: ${error.message}`
        });
      }

      // 요청 간 딜레이 (서버 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setBulkResults(results);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (failCount === 0) {
      setExcelSuccess(`모든 사용자(${successCount}명) 등록이 완료되었습니다.`);
    } else {
      setExcelError(`${successCount}명 성공, ${failCount}명 실패했습니다.`);
    }

    setExcelLoading(false);
  };

  // 사용자 리스트 조회
  const fetchUserList = async () => {
    setUserListLoading(true);
    setUserListError("");

    try {
      const response = await apiCall(
        "http://localhost:8082/api/mypage/admin/users",
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserList(result.data || []);
        } else {
          setUserListError(result.message || "사용자 목록을 불러오는데 실패했습니다.");
        }
      } else {
        setUserListError("사용자 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
      setUserListError("사용자 목록을 불러오는데 실패했습니다.");
    } finally {
      setUserListLoading(false);
    }
  };

  // 사용자 검색 필터링
  const getFilteredUsers = () => {
    return userList.filter(user => {
      const matchesSearch = !searchQuery || 
        user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.identifierNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.deptName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === "ALL" || user.userType === filterRole;
      
      return matchesSearch && matchesRole;
    });
  };

  // 사용자 상태 변경
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      
      const response = await apiCall(
        `http://localhost:8082/api/mypage/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accountStatus: newStatus }),
        }
      );

      if (response.ok) {
        // 목록 새로고침
        fetchUserList();
      } else {
        setUserListError("사용자 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("사용자 상태 변경 실패:", error);
      setUserListError("사용자 상태 변경에 실패했습니다.");
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

            {/* 관리자 전용 - 사용자 추가 카드들 */}
            {userProfile.userType === "ADMIN" && (
              <>
                <div
                  className="menu-card admin-card"
                  onClick={() => openModal("add-user")}
                >
                  <div className="menu-icon">➕</div>
                  <h3>사용자 추가</h3>
                  <p>학생, 교수, 상담사, 관리자 계정 생성</p>
                  <div className="menu-arrow">→</div>
                </div>

                <div
                  className="menu-card admin-card"
                  onClick={() => openModal("bulk-add-user")}
                >
                  <div className="menu-icon">📊</div>
                  <h3>일괄 사용자 추가</h3>
                  <p>엑셀 파일로 여러 사용자를 한번에 등록</p>
                  <div className="menu-arrow">→</div>
                </div>

                <div
                  className="menu-card admin-card"
                  onClick={() => openModal("user-list")}
                >
                  <div className="menu-icon">👥</div>
                  <h3>사용자 관리</h3>
                  <p>전체 사용자 목록 조회 및 상태 관리</p>
                  <div className="menu-arrow">→</div>
                </div>
              </>
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
                  {activeModal === "bulk-add-user" && "📊 일괄 사용자 추가"}
                  {activeModal === "user-list" && "👥 사용자 관리"}
                  {activeModal === "detail" && "📋 상담내용 상세보기"}
                </h2>
                <button
                  className="close-button-new"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body-new">
                {/* 개인정보 모달 */}
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
                            {userProfile.userType === "STUDENT" ? "학번" : "사번"}
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
                        {userProfile.userType === "STUDENT" && userProfile.gradeYear && (
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
                              {new Date(userProfile.enterDate).toLocaleDateString("ko-KR")}
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
                              {userProfile.postalCode && `(${userProfile.postalCode}) `}
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
                                {new Date(userProfile.lastLoginDate).toLocaleString("ko-KR")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 사용자 관리 모달 */}
                {activeModal === "user-list" && (
                  <div className="user-list-container">
                    {/* 검색 및 필터 섹션 */}
                    <div className="list-controls">
                      <div className="search-section">
                        <div className="search-group">
                          <input
                            type="text"
                            placeholder="이름, ID, 학번/사번, 학과로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                          />
                          <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="filter-select"
                          >
                            <option value="ALL">전체 역할</option>
                            <option value="STUDENT">학생</option>
                            <option value="PROFESSOR">교수</option>
                            <option value="COUNSELOR">상담사</option>
                            <option value="ADMIN">관리자</option>
                            <option value="GUEST">게스트</option>
                          </select>
                        </div>
                        <button
                          onClick={fetchUserList}
                          disabled={userListLoading}
                          className="btn btn-outline-primary refresh-btn"
                        >
                          🔄 새로고침
                        </button>
                      </div>

                      {/* 통계 정보 */}
                      <div className="user-stats">
                        <div className="stat-box">
                          <span className="stat-number">{getFilteredUsers().length}</span>
                          <span className="stat-label">검색 결과</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-number">{userList.filter(u => u.accountStatus === 'ACTIVE').length}</span>
                          <span className="stat-label">활성 사용자</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-number">{userList.filter(u => u.userType === 'STUDENT').length}</span>
                          <span className="stat-label">학생</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-number">{userList.filter(u => ['PROFESSOR', 'COUNSELOR', 'ADMIN'].includes(u.userType)).length}</span>
                          <span className="stat-label">교직원</span>
                        </div>
                      </div>
                    </div>

                    {/* 로딩 상태 */}
                    {userListLoading && (
                      <div className="loading-section">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>사용자 목록을 불러오는 중...</p>
                      </div>
                    )}

                    {/* 에러 메시지 */}
                    {userListError && (
                      <div className="alert alert-danger" role="alert">
                        {userListError}
                      </div>
                    )}

                    {/* 사용자 목록 테이블 */}
                    {!userListLoading && userList.length > 0 && (
                      <div className="user-table-container">
                        <table className="user-table">
                          <thead>
                            <tr>
                              <th>이름</th>
                              <th>사용자ID</th>
                              <th>역할</th>
                              <th>학번/사번</th>
                              <th>학과</th>
                              <th>이메일</th>
                              <th>전화번호</th>
                              <th>상태</th>
                              <th>가입일</th>
                              <th>관리</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredUsers().map((user, index) => (
                              <tr key={index} className={user.accountStatus === 'ACTIVE' ? 'active-row' : 'inactive-row'}>
                                <td className="user-name">
                                  <div className="name-cell">
                                    <span className="name">{user.userName || '이름 없음'}</span>
                                    {user.gradeYear && (
                                      <span className="grade-badge">{user.gradeYear}학년</span>
                                    )}
                                  </div>
                                </td>
                                <td className="user-id">{user.userId}</td>
                                <td>
                                  <span className={`role-badge role-${user.userType?.toLowerCase()}`}>
                                    {getUserTypeLabel(user.userType)}
                                  </span>
                                </td>
                                <td className="identifier">{user.identifierNo || '-'}</td>
                                <td className="dept">{user.deptName || '-'}</td>
                                <td className="email">{user.email || '-'}</td>
                                <td className="phone">{user.phoneNumber || '-'}</td>
                                <td>
                                  <span className={`status-badge status-${user.accountStatus?.toLowerCase()}`}>
                                    {user.accountStatus === 'ACTIVE' ? '활성' : '비활성'}
                                  </span>
                                </td>
                                <td className="created-date">
                                  {user.accountCreatedDate ? 
                                    new Date(user.accountCreatedDate).toLocaleDateString('ko-KR') : '-'
                                  }
                                </td>
                                <td className="actions">
                                  <button
                                    onClick={() => toggleUserStatus(user.userId, user.accountStatus)}
                                    className={`btn btn-sm ${user.accountStatus === 'ACTIVE' ? 'btn-warning' : 'btn-success'}`}
                                    title={user.accountStatus === 'ACTIVE' ? '비활성화' : '활성화'}
                                  >
                                    {user.accountStatus === 'ACTIVE' ? '🔒' : '🔓'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {getFilteredUsers().length === 0 && (
                          <div className="no-results">
                            <p>검색 조건에 맞는 사용자가 없습니다.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 데이터가 없는 경우 */}
                    {!userListLoading && userList.length === 0 && !userListError && (
                      <div className="no-data">
                        <p>등록된 사용자가 없습니다.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 개별 사용자 추가 모달 */}
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
                            <label htmlFor="deptCode">학과 <span className="required">*</span></label>
                            <select
                              id="deptCode"
                              name="deptCode"
                              value={userForm.deptCode}
                              onChange={handleFormChange}
                              required
                              className="form-control"
                              disabled={deptLoading}
                            >
                              <option value="">학과를 선택하세요</option>
                              {getFilteredDeptList().map((dept) => (
                                <option key={dept.deptCd} value={dept.deptCd}>
                                  {dept.deptNm} ({dept.deptCd})
                                </option>
                              ))}
                            </select>
                            {deptLoading && (
                              <small className="form-text text-muted">학과 목록을 불러오는 중...</small>
                            )}
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

                {/* 일괄 사용자 추가 모달 */}
                {activeModal === "bulk-add-user" && (
                  <div className="bulk-user-container">
                    {/* 템플릿 다운로드 섹션 */}
                    <div className="bulk-section">
                      <h4>1단계: 템플릿 다운로드</h4>
                      <p>아래 버튼을 클릭하여 사용자 등록용 엑셀 템플릿을 다운로드하세요.</p>
                      <button
                        type="button"
                        onClick={downloadExcelTemplate}
                        className="btn btn-outline-primary"
                      >
                        📥 엑셀 템플릿 다운로드
                      </button>
                                              <div className="bulk-info">
                        <h5>📋 필수 입력 항목:</h5>
                        <ul>
                          <li><strong>사용자ID, 비밀번호, 역할, 이름, 학과코드</strong> - 모든 사용자 필수</li>
                          <li><strong>학번</strong> - 학생(STUDENT) 역할일 때 필수</li>
                          <li><strong>사번</strong> - 교직원(PROFESSOR, COUNSELOR, ADMIN) 역할일 때 필수</li>
                        </ul>
                        <p><strong>역할 옵션:</strong> STUDENT, PROFESSOR, COUNSELOR, ADMIN</p>
                        <p><strong>학과코드 규칙:</strong></p>
                        <ul>
                          <li>학생: S_로 시작 (예: S_COMP001)</li>
                          <li>교수: P_로 시작 (예: P_COMP001)</li>
                          <li>상담사: C_로 시작 (예: C_COUNSEL001)</li>
                          <li>관리자: A_로 시작 (예: A_ADMIN001)</li>
                        </ul>
                      </div>
                    </div>

                    {/* 파일 업로드 섹션 */}
                    <div className="bulk-section">
                      <h4>2단계: 엑셀 파일 업로드</h4>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          id="excelFile"
                          accept=".xlsx,.xls"
                          onChange={handleExcelUpload}
                          className="file-input"
                        />
                        <label htmlFor="excelFile" className="file-upload-label">
                          <span className="upload-icon">📁</span>
                          <span>{excelFile ? excelFile.name : '엑셀 파일을 선택해주세요'}</span>
                        </label>
                      </div>
                    </div>

                    {/* 미리보기 섹션 */}
                    {excelData.length > 0 && (
                      <div className="bulk-section">
                        <h4>3단계: 데이터 확인</h4>
                        <div className="data-preview">
                          <div className="preview-stats">
                            <span className="stat-item">
                              📊 총 {excelData.length}개 데이터
                            </span>
                            <span className="stat-item error">
                              ❌ 오류 {excelData.filter(row => row.errors.length > 0).length}개
                            </span>
                            <span className="stat-item success">
                              ✅ 정상 {excelData.filter(row => row.errors.length === 0).length}개
                            </span>
                          </div>
                          
                          <div className="preview-table-container">
                            <table className="preview-table">
                              <thead>
                                <tr>
                                  <th>행번호</th>
                                  <th>사용자ID</th>
                                  <th>이름</th>
                                  <th>역할</th>
                                  <th>학과코드</th>
                                  <th>학번/사번</th>
                                  <th>상태</th>
                                </tr>
                              </thead>
                              <tbody>
                                {excelData.slice(0, 10).map((row, index) => (
                                  <tr key={index} className={row.errors.length > 0 ? 'error-row' : 'success-row'}>
                                    <td>{row.rowNumber}</td>
                                    <td>{row.userId}</td>
                                    <td>{row.name}</td>
                                    <td>{row.roleType}</td>
                                    <td>{row.deptCode}</td>
                                    <td>{row.studentNo || row.employeeNo}</td>
                                    <td>
                                      {row.errors.length > 0 ? (
                                        <span className="error-text" title={row.errors.join(', ')}>
                                          오류 {row.errors.length}개
                                        </span>
                                      ) : (
                                        <span className="success-text">정상</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {excelData.length > 10 && (
                              <p className="preview-more">... 외 {excelData.length - 10}개 더</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 등록 실행 섹션 */}
                    {excelData.length > 0 && (
                      <div className="bulk-section">
                        <h4>4단계: 일괄 등록 실행</h4>
                        <div className="bulk-actions">
                          <button
                            type="button"
                            onClick={handleBulkSubmit}
                            disabled={excelLoading || excelData.filter(row => row.errors.length === 0).length === 0}
                            className="btn btn-primary"
                          >
                            {excelLoading ? "등록 중..." : `${excelData.filter(row => row.errors.length === 0).length}명 일괄 등록`}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 결과 섹션 */}
                    {bulkResults.length > 0 && (
                      <div className="bulk-section">
                        <h4>등록 결과</h4>
                        <div className="results-container">
                          <div className="results-summary">
                            <span className="result-stat success">
                              성공: {bulkResults.filter(r => r.success).length}명
                            </span>
                            <span className="result-stat error">
                              실패: {bulkResults.filter(r => !r.success).length}명
                            </span>
                          </div>
                          
                          <div className="results-table-container">
                            <table className="results-table">
                              <thead>
                                <tr>
                                  <th>행번호</th>
                                  <th>사용자ID</th>
                                  <th>이름</th>
                                  <th>결과</th>
                                  <th>메시지</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bulkResults.map((result, index) => (
                                  <tr key={index} className={result.success ? 'success-row' : 'error-row'}>
                                    <td>{result.rowNumber}</td>
                                    <td>{result.userId}</td>
                                    <td>{result.name}</td>
                                    <td>
                                      <span className={result.success ? 'success-badge' : 'error-badge'}>
                                        {result.success ? '성공' : '실패'}
                                      </span>
                                    </td>
                                    <td>{result.message}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 알림 메시지 */}
                    {excelSuccess && (
                      <div className="alert alert-success" role="alert">
                        {excelSuccess}
                      </div>
                    )}
                    
                    {excelError && (
                      <div className="alert alert-danger" role="alert">
                        {excelError}
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