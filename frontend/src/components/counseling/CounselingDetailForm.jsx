// src/components/counseling/CounselingDetailForm.jsx
import React from 'react';

const CounselingDetailForm = ({ data, onWriteRecord }) => {
	if (!data) {
		return (
			<div className="table_conatiner">
				<div style={{ textAlign: 'center', padding: '50px' }}>
					데이터를 불러오는 중...
				</div>
			</div>
		);
	}

	const {
		typeCd = '',
		stdNo = '',
		deptNm = '',
		reqDttm = '',
		phone = '',
		statCd = '',
		email = '',
		applyContent = '',
		file = ''
	} = data;

	return (
		<div className="table_conatiner">
			<table className="form_write">
				<tbody>
					<tr>
						<td style={{ width: '10%' }}>상담 분류</td>
						<td style={{ width: '40%' }}>
							<input type="text" value={typeCd} readOnly />
						</td>
						<td style={{ width: '10%' }}>학번</td>
						<td>
							<input type="text" value={stdNo} readOnly />
						</td>
					</tr>
					<tr>
						<td>학과</td>
						<td>
							<input type="text" value={deptNm} readOnly />
						</td>
						<td>연락처</td>
						<td>
							<input type="text" value={phone} readOnly />
						</td>
					</tr>
					<tr>
						<td>상담 일시</td>
						<td>
							<input
								type="text"
								value={reqDttm?.replace('T', ' ').slice(0, 16)}
								readOnly
							/>
						</td>
						<td>이메일</td>
						<td>
							<input type="text" value={email} readOnly />
						</td>
					</tr>
					<tr>
						<td>진행 상태</td>
						<td>
							<input type="text" value={statCd} readOnly />
						</td>
						<td>첨부 파일</td>
						<td>
							<input
								type="file"
								name="file"
								id="file"
								accept=".jpg, .jpeg, .png, .pdf"
								readOnly
							/>
						</td>
					</tr>
					<tr>
						<td>상담내용</td>
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
									backgroundColor: '#ddd',
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
					<tr>
						<td colSpan="4" className="form-buttons">
							<button
								className="btn btn-success"
								id="write_record"
								onClick={onWriteRecord}
							>
								상담일지 쓰기
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default CounselingDetailForm;