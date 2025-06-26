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

export const calendarApi = {
	async getCalendarEvents(counselorId, startDate, endDate) {
		const query = new URLSearchParams({
			counselorId,
			startDate,
			endDate
		}).toString();

		const res = await apiService.get(`/calendar/events?${query}`);
		return res;
	}
};

// 상담 관련 API
export const counselingApi = {
	// 상담 신청 목록 조회
	getCounselingList: (params) => {
		const queryString = new URLSearchParams(params).toString();
		return apiService.get(`/counseling/applications?${queryString}`);
	},

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

	// 상담 일정 조회
	checkScheduleExists: (emplNo) =>
		fetch(`/api/counseling/schedule/exists/${emplNo}`)
			.then(res => {
				if (res.status === 204) return { exists: false }; // 일정 없음
				if (!res.ok) throw new Error('응답 실패');
				return res.json();
			}),

	// 상담 일정 등록
	registerSchedule: (scheduleData) =>
		fetch('/api/counseling/schedule', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(scheduleData),
		}).then(res => {
			if (!res.ok) throw new Error('상담 일정 등록 실패');
			return res.json();
		}),

	// 상담 일지 조회
	getCounselingRecord: (id) =>
		fetch(`/api/counseling/records/${id}`)
			.then(res => {
				if (res.status === 204) return { success: true, data: null };
				if (!res.ok) throw new Error('상담일지 조회 실패');
				return res.json();
			}),

	// 상담 일지 등록
	saveCounselingRecord: (id, data) =>
		fetch(`/api/counseling/records/${id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		}).then(res => {
			if (!res.ok) throw new Error('상담일지 저장 실패');
			return res.json();
		}),

	// 상담 일지 수정
	updateCounselingRecord: (id, data) =>
		apiService.put(`/counseling/records/${id}`, data),

	// 예약 시간 받아오기
	getReservedTimes: (date) =>
		apiService.get('/counseling/reserved-times', { date }),
};

// --- 채팅방 관련 API ---
export const chatApi = {
	// 전체 채팅방 목록 (상담사용)
	getAllRooms: () => apiService.get('/api/chat/rooms'),

	// 상담사 미배정 방만 조회
	getUnassignedRooms: () => apiService.get('/api/chat/rooms/unassigned'),

	// 채팅방 생성 (학생용)
	createRoom: (data) => apiService.post('/chat/rooms', data),

	// 상담사가 특정 방에 배정
	assignCounselor: (roomId, counselorId) =>
		apiService.patch(`/chat/rooms/${roomId}/assign`, {
			assignedCounselorId: counselorId,
		}),
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

	createNoticeWithFiles: (formData) =>
		fetch('/api/notices/with-files', {
			method: 'POST',
			body: formData,
			credentials: 'include'
		}),

	updateNotice: (id, data) =>
		apiService.put(`/notices/${id}`, data),

	updateNoticeWithFiles: (id, formData) =>
		fetch(`/api/notices/${id}/with-files`, {
			method: 'PUT',
			body: formData,
			credentials: 'include'
		}),
	getNoticeFiles: (id) =>
		apiService.get(`/notices/${id}/files`),

	uploadNoticeFiles: (id, formData) =>
		fetch(`/api/notices/${id}/files`, {
			method: 'POST',
			body: formData,
			credentials: 'include'
		}),

	deleteNoticeFile: (noticeId, fileId) =>
		apiService.delete(`/notices/${noticeId}/files/${fileId}`),

	deleteNotice: (id) =>
		apiService.delete(`/notices/${id}`),
};

export default apiService;