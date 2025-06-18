// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    const config = {
	  credentials: 'include',
	  headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
  
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

const apiService = new ApiService(API_BASE_URL);

// 사용자 정보 조회
export const userApi = {
  getSummary: () =>
    apiService.get('/mypage/profile')
};

// 상담 관련 API
export const counselingApi = {
  // 상담 신청 목록 조회
  getCounselingList: (params) => 
    apiService.get('/counseling/applications', params),
  
  // 상담 코드
  getCodes: (group) =>
    fetch(`/api/common/codes?group=${group}`)
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`응답 오류: ${res.status} / ${text}`);
          });
        }
        return res.json();
      }),
  // 상담 신청
  createCounselingApplication: (data) => 
    apiService.post('/counseling/apply', data),
  
  
  
  // 상담 신청 상세 조회
  getCounselingDetail: (id) => 
    apiService.get(`/counseling/${id}`),
  
  // 상담사 배정
  assignCounselor: (aplyId, payload) =>
      apiService.patch(`/counseling/applications/${aplyId}/assign`, payload),
  
  // 상담 상태 업데이트
  updateCounselingStatus: (id, status) => 
    apiService.put(`/counseling/applications/${id}/status`, { status }),
  
  // 상담 신청 삭제
  deleteCounseling: (id) => 
    apiService.delete(`/counseling/applications/${id}`),
  
  // 상담 일지 목록 조회
  getCounselingRecords: (params) => 
    apiService.get('/counseling/records', params),
  
  // 상담 일지 생성
  createCounselingRecord: (data) => 
    apiService.post('/counseling/records', data),
  
  // 상담 일지 수정
  updateCounselingRecord: (id, data) => 
    apiService.put(`/counseling/records/${id}`, data),
};

// 인증 관련 API
export const authApi = {
  login: (credentials) => 
    apiService.post('/auth/login', credentials),
  
  logout: () => 
    apiService.post('/auth/logout'),
  
  verify: () => 
    apiService.get('/auth/verify'),
  
  refreshToken: () => 
    apiService.post('/auth/refresh'),
};

// 공지사항 관련 API
export const noticeApi = {
  getNotices: (params) => 
    apiService.get('/notices', params),
  
  getNoticeDetail: (id) => 
    apiService.get(`/notices/${id}`),
  
  createNotice: (data) => 
    apiService.post('/notices', data),
  
  updateNotice: (id, data) => 
    apiService.put(`/notices/${id}`, data),
  
  deleteNotice: (id) => 
    apiService.delete(`/notices/${id}`),
};

export default apiService;