import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import ChatModal from '../components/common/ChatModal.jsx';

const CounselorChatList = () => {
	const { user, loading: authLoading } = useAuth();
	const [chatRooms, setChatRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedRoomId, setSelectedRoomId] = useState(null);
	const [filter, setFilter] = useState('all'); // all, active, completed
	const [searchTerm, setSearchTerm] = useState('');

	// 채팅방 목록 조회
	const fetchChatRooms = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch('/api/chat/rooms', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});

			if (!response.ok) {
				throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
			}

			const data = await response.json();
			setChatRooms(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user?.role === 'COUNSELOR') {
			fetchChatRooms();
		}
	}, [user]);

	// 채팅방 상태별 필터링
	const getFilteredRooms = () => {
		let filtered = chatRooms;

		// 상태 필터
		if (filter === 'active') {
			filtered = filtered.filter(room => room.status === 'ACTIVE');
		} else if (filter === 'completed') {
			filtered = filtered.filter(room => room.status === 'COMPLETED');
		}

		// 검색 필터
		if (searchTerm) {
			filtered = filtered.filter(room =>
				room.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				room.roomId.toString().includes(searchTerm)
			);
		}

		return filtered;
	};

	// 시간 포맷팅
	const formatDateTime = (dateTimeStr) => {
		const date = new Date(dateTimeStr);
		const now = new Date();
		const diffInHours = (now - date) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString('ko-KR', {
				hour: '2-digit',
				minute: '2-digit'
			});
		} else {
			return date.toLocaleDateString('ko-KR', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}
	};

	// 채팅방 입장
	const handleJoinRoom = async (roomId) => {
	  const room = chatRooms.find(r => r.roomId === roomId);
	  if (!room) return;

	  try {
	    if (!room.assignedCounselorId) {
	      const res = await fetch(`/api/chat/rooms/${roomId}/assign`, {
	        method: 'PATCH',
	        headers: {
	          'Content-Type': 'application/json',
	          'Authorization': `Bearer ${localStorage.getItem('token')}`
	        },
	        body: JSON.stringify({
	          assignedCounselorId: user?.userId
	        })
	      });

	      if (!res.ok) throw new Error('상담사 배정 실패');

	      await fetchChatRooms(); // ✅ 중요: 상태 갱신
	    }

	    setSelectedRoomId(roomId); // 모달 오픈
	  } catch (err) {
	    console.error('상담 시작 오류:', err);
	    alert('상담 시작에 실패했습니다.');
	  }
	};

	// 채팅방 나가기
	const handleCloseChat = () => {
		setSelectedRoomId(null);
		fetchChatRooms(); // 목록 새로고침
	};

	if (authLoading) {
		return <div>사용자 정보를 불러오는 중...</div>;
	}

	// 상담사가 아닌 경우 접근 차단
	if (!user || user.role !== 'COUNSELOR') {
		return (
			<div className="container mt-5">
				<div className="alert alert-warning">
					<h4>접근 권한이 없습니다</h4>
					<p>이 페이지는 상담사만 접근할 수 있습니다.</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="container mt-5">
				<div className="text-center">
					<div className="spinner-border" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-2">채팅방 목록을 불러오는 중...</p>
				</div>
			</div>
		);
	}

	const filteredRooms = getFilteredRooms();

	return (
		<div className="container mt-4">
			<div className="row">
				<div className="col-12">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h2>상담 채팅방 관리</h2>
						<button
							className="btn btn-outline-primary"
							onClick={fetchChatRooms}
						>
							<i className="bi bi-arrow-clockwise me-2"></i>
							새로고침
						</button>
					</div>

					{error && (
						<div className="alert alert-danger" role="alert">
							{error}
						</div>
					)}

					{/* 필터 및 검색 */}
					<div className="card mb-4 shadow-sm">
						<div className="card-body">
							<div className="row">
								<div className="col-md-6">
									<label htmlFor="filter" className="form-label">상태 필터</label>
									<select
										id="filter"
										className="form-select"
										value={filter}
										onChange={(e) => setFilter(e.target.value)}
									>
										<option value="all">전체</option>
										<option value="active">진행 중</option>
										<option value="completed">완료됨</option>
									</select>
								</div>
								<div className="col-md-6">
									<label htmlFor="search" className="form-label">검색</label>
									<input
										type="text"
										id="search"
										className="form-control"
										placeholder="학생 이름으로 검색"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* 채팅방 목록 */}
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h5 className="mb-0">
							상담 대기 목록 ({filteredRooms.length}개)
						</h5>
					</div>

					{filteredRooms.length === 0 ? (
						<div className="card shadow-sm">
							<div className="card-body text-center py-5">
								<i className="bi bi-chat-dots fs-1 text-muted mb-3"></i>
								<p className="text-muted">조건에 맞는 채팅방이 없습니다.</p>
							</div>
						</div>
					) : (
						<div className="row">
							{filteredRooms.map((room) => (
								<div key={room.roomId} className="col-lg-6 col-xl-4 mb-4">
									<div className="card h-100 shadow-sm border-0">
										<div className="card-body">
											<div className="d-flex justify-content-between align-items-start mb-3">
												<div className="d-flex align-items-center">
													<div className="avatar-circle me-3">
														<i className="bi bi-person-fill fs-4"></i>
													</div>
													<div>
														<h6 className="mb-0 fw-bold">{room.customerName}</h6>
													</div>
												</div>
												<div className="text-end">
													<span className={`badge ${room.status === 'ACTIVE'
															? 'bg-success'
															: room.status === 'COMPLETED'
																? 'bg-secondary'
																: 'bg-warning'
														}`}>
														{room.status === 'ACTIVE' ? '진행중' :
															room.status === 'COMPLETED' ? '완료' :
																room.status === 'WAITING' ? '대기중' : room.status}
													</span>
													{room.unreadCount > 0 && (
														<span className="badge bg-danger ms-1">
															{room.unreadCount}
														</span>
													)}
												</div>
											</div>

											{room.lastMessage && (
												<div className="mb-3">
													<p className="text-muted small mb-1">최근 메시지:</p>
													<p className="mb-0 text-truncate" style={{ fontSize: '0.9rem' }}>
														{room.lastMessage}
													</p>
												</div>
											)}

											<div className="d-flex justify-content-between align-items-center text-muted small mb-3">
												<span>
													<i className="bi bi-clock me-1"></i>
													{formatDateTime(room.createdAt)}
												</span>
												{room.lastMessageTime && (
													<span>
														<i className="bi bi-chat me-1"></i>
														{formatDateTime(room.lastMessageTime)}
													</span>
												)}
											</div>

											<button
												className={`btn w-100 ${room.status === 'COMPLETED'
														? 'btn-outline-secondary'
														: room.unreadCount > 0
															? 'btn-primary'
															: 'btn-outline-primary'
													}`}
												onClick={() => handleJoinRoom(room.roomId)}
												disabled={room.status === 'COMPLETED'}
											>
												{room.status === 'COMPLETED' ? (
													<>
														<i className="bi bi-check-circle me-2"></i>
														완료됨
													</>
												) : (
													<>
														<i className="bi bi-chat-dots me-2"></i>
														상담 시작
													</>
												)}
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* 채팅 모달 */}
			{selectedRoomId && (
				<ChatModal
					roomId={selectedRoomId}
					onClose={handleCloseChat}
				/>
			)}

			<style jsx>{`
        .avatar-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
        }
        
        .btn {
          transition: all 0.2s ease;
        }
      `}</style>
		</div>
	);
};

export default CounselorChatList;