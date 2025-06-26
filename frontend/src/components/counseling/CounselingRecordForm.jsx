// src/components/counseling/CounselingRecordForm.jsx
import React, { useState, useEffect } from 'react';

const CounselingRecordForm = ({
	counselingDetail,
	recordData, // 이제 배열로 전달됨
	onSaveRecord,
	onOpenScheduleModal,
	loading
}) => {
	const [recordTitle, setRecordTitle] = useState('');
	const [recordContent, setRecordContent] = useState('');
	const [counselingCategory, setCounselingCategory] = useState('심리상담');
	const [expandedRecords, setExpandedRecords] = useState(new Set()); // 펼쳐진 일지들의 인덱스 관리

	// 새 상담 일지 작성 폼은 항상 빈 상태로 유지
	useEffect(() => {
		setRecordTitle('');
		setRecordContent('');
	}, [recordData]);

	// 아코디언 토글 함수
	const toggleRecord = (index) => {
		const newExpanded = new Set(expandedRecords);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		setExpandedRecords(newExpanded);
	};

	const handleSaveRecord = () => {
		if (!recordTitle.trim() || !recordContent.trim()) {
			alert('제목과 내용을 모두 입력해주세요.');
			return;
		}

		onSaveRecord({
			title: recordTitle,
			content: recordContent,
			category: counselingCategory,
			writeTime: new Date().toLocaleString(),
			writer: counselingDetail.emplNm
		});
	};

	if (!counselingDetail) {
		return <div>데이터를 불러오는 중...</div>;
	}

	const {
		typeCd = '',
		stdNo = '',
		deptNm = '',
		reqDttm = '',
		phone = '',
		statCd = '',
		email = '',
		gender = '',
		applyContent = '',
		stdNm = ''
	} = counselingDetail;

	// recordData가 배열인지 확인하고, 아니면 빈 배열로 처리
	const recordList = Array.isArray(recordData)
	  ? recordData.filter(r => r && r.title && r.content) // 제목+내용 있는 것만
	  : (recordData && recordData.title && recordData.content ? [recordData] : []);

	return (
		<>
			<style>{`
				@keyframes slideDown {
					from {
						opacity: 0;
						max-height: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						max-height: 500px;
						transform: translateY(0);
					}
				}
			`}</style>
			
			{/* 상담 신청 내역 */}
			<table className="form_write">
				<tbody>
					<tr>
						<td><label>상담 분류</label></td>
						<td>
							<input type="text" value={typeCd} readOnly />
						</td>
						<td><label htmlFor="student_number" style={{ padding: '0px 5px' }}>학번</label></td>
						<td>
							<input type="text" value={stdNo} readOnly />
						</td>
					</tr>
					<tr>
						<td><label>상담 방식</label></td>
						<td>
							<input type="text" value="대면" readOnly />
						</td>
						<td><label htmlFor="major" style={{ padding: '0px 5px' }}>학과</label></td>
						<td>
							<input type="text" value={deptNm} readOnly />
						</td>
					</tr>
					<tr>
						<td><label>상담 일시</label></td>
						<td>
							<input type="text" value={reqDttm} readOnly />
						</td>
						<td><label style={{ padding: '0px 5px' }}>연락처</label></td>
						<td>
							<input type="text" value={phone} readOnly />
						</td>
					</tr>
					<tr>
						<td><label htmlFor="progress">진행 상태</label></td>
						<td>
							<input type="text" value={statCd} readOnly />
						</td>
						<td><label htmlFor="email" style={{ padding: '0px 5px' }}>이메일</label></td>
						<td>
							<input type="text" value={email} readOnly />
						</td>
					</tr>
					<tr>
						<td><label htmlFor="file">첨부 파일</label></td>
						<td>
							<input
								type="file"
								name="file"
								id="file"
								accept=".jpg, .jpeg, .png, .pdf"
								readOnly
							/>
						</td>
						<td colSpan="2"></td>
					</tr>
					<tr>
						<td><label htmlFor="content">상담내용</label></td>
						<td colSpan="3">
							<div
								className="content-display"
								dangerouslySetInnerHTML={{ __html: applyContent }}
								style={{
									width: '100%',
									minHeight: '240px',
									padding: '10px',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '16px',
									backgroundColor: '#f9f9f9',
									boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
									resize: 'none',
									overflow: 'auto',
									whiteSpace: 'pre-wrap',
									wordWrap: 'break-word',
									fontFamily: 'inherit',
									lineHeight: '1.5',
									textAlign: 'left'
								}}
							/>
						</td>
					</tr>
				</tbody>
			</table>

			<br />

			{/* 상담 일지 */}
			<h4 className="board_title">
				<b>{counselingDetail.stdNm || ''}</b> 학생의 상담 일지
			</h4>

			{/* 기존 저장된 일지들이 있을 때 표시 */}
			{recordList.length > 0 && (
				<div style={{ marginBottom: '30px' }}>
					<h5 style={{ 
						backgroundColor: '#4CAF50', 
						margin: '0 0 15px 0', 
						padding: '12px',
						textAlign: 'center',
						fontWeight: 'bold',
						color: 'white',
						borderRadius: '4px'
					}}>
						저장된 상담 일지 ({recordList.length}개)
					</h5>
					
					{recordList.map((record, index) => (
						<div key={index} className="table_container" style={{ 
							marginBottom: '15px',
							borderRadius: '8px',
							padding: '0',
							border: '2px solid #4CAF50',
							overflow: 'hidden'
						}}>
							{/* 헤더 - 클릭 가능한 영역 */}
							<div 
								onClick={() => toggleRecord(index)}
								style={{
									backgroundColor: expandedRecords.has(index) ? '#4CAF50' : '#f8f9fa',
									color: expandedRecords.has(index) ? 'white' : '#333',
									padding: '15px',
									cursor: 'pointer',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									fontWeight: 'bold',
									transition: 'all 0.3s ease',
									borderBottom: expandedRecords.has(index) ? '1px solid rgba(255,255,255,0.2)' : 'none'
								}}
							>
								<div>
									<span style={{ fontSize: '16px' }}>일지 #{index + 1}: {record.title}</span>
									<span style={{ 
										fontSize: '14px', 
										opacity: 0.8, 
										marginLeft: '15px',
										fontWeight: 'normal'
									}}>
										{record.createdAt || record.writeTime}
									</span>
								</div>
								<span style={{ 
									fontSize: '18px',
									transform: expandedRecords.has(index) ? 'rotate(180deg)' : 'rotate(0deg)',
									transition: 'transform 0.3s ease'
								}}>
									▼
								</span>
							</div>
							
							{/* 내용 - 펼쳐질 때만 표시 */}
							{expandedRecords.has(index) && (
								<div style={{ 
									padding: '15px',
									backgroundColor: 'white',
									animation: 'slideDown 0.3s ease'
								}}>
									<table className="form_write">
										<tbody>
											<tr>
												<td><label>작성자</label></td>
												<td>
													<input 
														type="text" 
														value={record.writer || counselingDetail?.emplNm || ''} 
														readOnly 
														style={{ fontSize: '14px' }}
													/>
												</td>
											</tr>
											<tr>
												<td><label>상담 내용</label></td>
												<td>
													<textarea
														rows="8"
														value={record.content}
														readOnly
														style={{ 
															width: '100%', 
															resize: 'none',
															fontSize: '14px',
															lineHeight: '1.6'
														}}
													/>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			<div className="table_container" style={{ 
				borderRadius: '8px',
				padding: '10px',
			}}>
				<h5 style={{ 
					backgroundColor: '#2196F3', 
					margin: '0 0 15px 0', 
					padding: '12px',
					textAlign: 'center',
					fontWeight: 'bold',
					color: 'white',
					borderRadius: '4px'
				}}>
					새 상담 일지 작성
				</h5>
				<table className="form_write">
					<tbody>
						<tr>
							<td><label>일지 제목</label></td>
							<td colSpan="3">
								<input
									type="text"
									id="record_title"
									value={recordTitle}
									onChange={(e) => setRecordTitle(e.target.value)}
									placeholder="일지 제목을 입력하세요"
								/>
							</td>
						</tr>
						<tr>
							<td><label htmlFor="write_time">작성 일시</label></td>
							<td>
								<input 
									type="text" 
									placeholder="저장시 자동으로 등록됩니다." 
									readOnly 
								/>
							</td>
							<td><label style={{ padding: '0px 5px' }}>상담사</label></td>
							<td>
								<input 
									type="text" 
									value={counselingDetail?.emplNm || ''} 
									readOnly 
								/>
							</td>
						</tr>
						<tr>
							<td><label>상담 내용</label></td>
							<td colSpan="3">
								<textarea
									id="record_content"
									rows="10"
									value={recordContent}
									onChange={(e) => setRecordContent(e.target.value)}
									placeholder="상담 후 사항을 입력하세요"
									required
									style={{ 
										width: '100%', 
										resize: 'vertical',
										minHeight: '200px'
									}}
								/>
							</td>
						</tr>
						<tr>
							<td colSpan="4" className="form-buttons" style={{ textAlign: 'center', padding: '20px' }}>
								<button
									className="btn btn-primary"
									id="save_record"
									onClick={handleSaveRecord}
									disabled={loading}
									style={{ 
										padding: '10px 20px',
										fontSize: '16px',
										minWidth: '150px'
									}}
								>
									{loading ? '저장 중...' : '상담 일지 등록'}
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</>
	);
};

export default CounselingRecordForm;