import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './useAuth'; // 현재 로그인된 유저 정보 가져오는 훅

// 역할 -> 한글 변환
const roleMap = {
  GUEST: '비회원',
  STUDENT: '학생',
  COUNSELOR: '상담사',
  PROFESSOR: '교수',
  ADMIN: '관리자',
};

/**
 * 권한 검사 훅
 * @param {Array} allowedRoles 허용된 권한 목록 (예: ['ADMIN', 'COUNSELOR'])
 */
const useAuthGuard = (allowedRoles) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 예: { id, role: 'STUDENT', name }

  useEffect(() => {
    // 로그인 안 된 경우 or 권한 불일치
    if (!user || !allowedRoles.includes(user.role)) {
      const allowedText = allowedRoles
        .map(role => roleMap[role] || role)
        .join(', ');
      alert(`${allowedText}만 접근 가능합니다.`);
      navigate(-1);
    }
  }, [user, allowedRoles, navigate]);
};

export default useAuthGuard;

/*

// 학생만 접근 가능한 페이지
useAuthGuard(['STUDENT']);
// → alert: "학생만 접근 가능합니다."

// 상담사 + 관리자 접근
useAuthGuard(['COUNSELOR', 'ADMIN']);
// → alert: "상담사, 관리자만 접근 가능합니다."

*/