import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import '/public/css/ProgramApplicationModal.css';

// 비교과 프로그램 신청 모달 컴포넌트
const ProgramApplicationModal = ({ isOpen, onClose, programData, onSubmit }) => {
    const { user, isLoggedIn } = useAuth();

    const [formData, setFormData] = useState({
        stdNo: '',
        userName: '',
        deptName: '',
        gradeYear: '',
        email: '',
        phoneNumber: '',
        remarks: '',
        privacyAgree: false,
        applicationFile: null
    });
    
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && programData) {
            const timer = setTimeout(() => {
                if (isLoggedIn && user) {
                    fetchUserProfileInfo();
                } else {
                    setError('로그인이 필요합니다.');
                }
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [isOpen, programData, isLoggedIn, user]);

    // 마이페이지 프로필 정보만 조회
    const fetchUserProfileInfo = async () => {
        setUserLoading(true);
        setError('');
        
        try {
            console.log('🟢 마이페이지 프로필 조회 시작');
            
            const profileResponse = await fetch('/api/mypage/profile', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('🟢 프로필 응답 상태:', profileResponse.status);

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log('🟢 프로필 응답 데이터:', profileData);
                
                const profile = profileData.success ? profileData.data : profileData;
                
                setFormData(prev => ({
                    ...prev,
                    stdNo: profile.identifierNo || user.identifierNo || '',
                    userName: profile.userName || user.name || '',
                    deptName: profile.deptName || '', 
                    gradeYear: profile.gradeYear || profile.grade || '', 
                    email: profile.email || profile.userEmail || `${profile.identifierNo || user.identifierNo}@university.ac.kr`,
                    phoneNumber: profile.phoneNumber || profile.userPhone || '010-0000-0000'
                }));
                
                console.log('✅ 사용자 정보 설정 완료');
            } else {
                console.warn('⚠️ 마이페이지 프로필 조회 실패, 기본 정보로 설정');
                
                setFormData(prev => ({
                    ...prev,
                    stdNo: user.identifierNo || '',
                    userName: user.name || '',
                    deptName: '정보학과',
                    gradeYear: '3',
                    email: `${user.identifierNo}@university.ac.kr`,
                    phoneNumber: '010-0000-0000'
                }));
            }
            
        } catch (err) {
            console.error('사용자 정보 조회 실패:', err);
            
            setFormData(prev => ({
                ...prev,
                stdNo: user.identifierNo || '',
                userName: user.name || '',
                deptName: '정보학과',
                gradeYear: '3',
                email: `${user.identifierNo}@university.ac.kr`,
                phoneNumber: '010-0000-0000'
            }));
            
            setError('사용자 정보를 일부 불러올 수 없습니다. 기본값으로 설정되었습니다.');
        } finally {
            setUserLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] || null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.stdNo.trim()) {
            setError('사용자 정보를 확인할 수 없습니다.');
            return;
        }
        
        if (!formData.phoneNumber.trim()) {
            setError('연락처를 입력해주세요.');
            return;
        }
        
        if (!formData.privacyAgree) {
            setError('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (formData.applicationFile) {
                const formDataToSend = new FormData();
                
                const applicationData = {
                    prgId: programData.prgId,
                    stdNo: formData.stdNo.trim(),
                    aplySelCd: '01',
                    aplyPhone: formData.phoneNumber.trim(),
                    aplyRemarks: formData.remarks.trim(),
                    privacyAgreeYn: formData.privacyAgree ? 'Y' : 'N'
                };

                formDataToSend.append('application', new Blob([JSON.stringify(applicationData)], { 
                    type: 'application/json' 
                }));
                
                formDataToSend.append('applicationFile', formData.applicationFile);

                console.log('파일과 함께 신청 데이터 전송');

                const response = await fetch(`/api/noncur/${programData.prgId}/apply-with-file`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formDataToSend
                });

                if (response.ok) {
                    setSuccess(true);
                    setTimeout(() => {
                        onSubmit();
                        onClose();
                    }, 2000);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '신청 처리 중 오류가 발생했습니다.');
                }
            } else {
                const jsonData = {
                    prgId: programData.prgId,
                    stdNo: formData.stdNo.trim(),
                    aplySelCd: '01',
                    aplyPhone: formData.phoneNumber.trim(),
                    aplyRemarks: formData.remarks.trim(),
                    privacyAgreeYn: formData.privacyAgree ? 'Y' : 'N'
                };

                console.log('신청 데이터 전송:', jsonData);

                const response = await fetch(`/api/noncur/${programData.prgId}/apply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(jsonData)
                });

                if (response.ok) {
                    setSuccess(true);
                    setTimeout(() => {
                        onSubmit();
                        onClose();
                    }, 2000);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '신청 처리 중 오류가 발생했습니다.');
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            stdNo: '', userName: '', deptName: '', gradeYear: '', email: '',
            phoneNumber: '', remarks: '', privacyAgree: false, applicationFile: null
        });
        setError('');
        setSuccess(false);
        setLoading(false);
        setUserLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const isSubmitEnabled = formData.privacyAgree && formData.phoneNumber.trim() && formData.stdNo.trim();

    if (!isOpen) return null;

    return (
        <div className="application-modal-overlay" onClick={handleClose}>
            <div className="application-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="application-modal-header">
                    <h3 className="application-modal-title">프로그램 신청서</h3>
                    <button className="application-modal-close" onClick={handleClose}>×</button>
                </div>

                <div className="application-modal-content">
                    {success ? (
                        <div className="application-success">
                            <div className="success-icon">✅</div>
                            <h3 className="success-title">신청이 완료되었습니다!</h3>
                            <p className="success-message">곧 목록으로 돌아갑니다.</p>
                        </div>
                    ) : !isLoggedIn ? (
                        <div className="auth-error-container">
                            <div className="auth-error-icon">🔐</div>
                            <h3 className="auth-error-title">로그인이 필요합니다</h3>
                            <p className="auth-error-message">
                                프로그램 신청을 위해 로그인해주세요.
                            </p>
                            <div className="auth-error-buttons">
                                <button className="btn-login" onClick={() => window.location.href = '/login'}>
                                    로그인 하기
                                </button>
                            </div>
                        </div>
                    ) : userLoading ? (
                        <div className="loading-container">
                            <div className="loading-icon">🔄</div>
                            사용자 정보를 불러오는 중...
                        </div>
                    ) : (
                        <>
                            {/* 프로그램 정보 */}
                            <div className="application-form-info">
                                <h4 className="program-info-title">신청 프로그램</h4>
                                <div className="program-info-content">
                                    <div className="program-name">{programData?.prgNm}</div>
                                    <div className="program-details">
                                        기간: {new Date(programData?.prgStDt).toLocaleDateString()} ~ {new Date(programData?.prgEndDt).toLocaleDateString()}<br/>
                                        모집인원: {programData?.maxCnt}명 (현재 {programData?.currentApplicants}명 신청)
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="error-container">
                                    ❌ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* 개인정보 섹션 */}
                                <div className="form-section noncur-application-section">
                                    <h4 className="section-header">신청자 정보</h4>
                                    
                                    <div className="input-grid">
                                        <div className="input-group">
                                            <label className="input-label">학번</label>
                                            <input
                                                type="text"
                                                value={formData.stdNo}
                                                disabled
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">이름</label>
                                            <input
                                                type="text"
                                                value={formData.userName}
                                                disabled
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="input-grid">
                                        <div className="input-group">
                                            <label className="input-label">학과</label>
                                            <input
                                                type="text"
                                                value={formData.deptName}
                                                disabled
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">학년</label>
                                            <input
                                                type="text"
                                                value={formData.gradeYear ? `${formData.gradeYear}학년` : ''}
                                                disabled
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="input-group">
                                        <label className="input-label">이메일</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="form-input"
                                        />
                                    </div>
                                    
                                    <div className="input-group">
                                        <label className="input-label">
                                            연락처 <span className="required">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            placeholder="010-1234-5678"
                                            required
                                            className="form-input"
                                        />
                                        <small className="input-help">
                                            * 연락처는 수정 가능합니다
                                        </small>
                                    </div>
                                </div>

                                {/* 신청서 및 비고 섹션 */}
                                <div className="form-section noncur-application-section">
                                    <h4 className="section-header additional">신청서 및 추가정보</h4>
                                    
                                    <div className="input-group">
                                        <label className="input-label">
                                            신청서 파일 업로드
                                        </label>
                                        
                                        <div className="file-upload-wrapper">
                                            <input
                                                type="file"
                                                name="applicationFile"
                                                onChange={handleInputChange}
                                                accept=".pdf,.doc,.docx,.hwp"
                                                className="file-upload-input"
                                            />
                                            
                                            <small className="input-help">
                                                * PDF, DOC, DOCX, HWP 파일만 업로드 가능
                                            </small>
                                            
                                            {formData.applicationFile && (
                                                <div className="file-selected-info">
                                                    <div className="file-selected-header">
                                                        <div className="file-selected-content">
                                                            <div className="file-selected-title">
                                                                선택된 파일
                                                            </div>
                                                            <div className="file-selected-name">
                                                                {formData.applicationFile.name}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, applicationFile: null }))}
                                                            className="file-remove-button"
                                                        >
                                                            제거
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="input-group">
                                        <label className="input-label">
                                            비고사항
                                        </label>
                                        <textarea
                                            name="remarks"
                                            value={formData.remarks}
                                            onChange={handleInputChange}
                                            placeholder="추가로 전달하고 싶은 내용이나 특이사항이 있다면 작성해주세요..."
                                            rows="4"
                                            className="form-textarea"
                                        />
                                    </div>
                                </div>

                                {/* 개인정보 수집 동의 */}
                                <div className="privacy-container">
                                    <h4 className="privacy-title">개인정보 수집 및 이용 동의</h4>
                                    <div className="privacy-content">
                                        <strong>[개인정보 수집 및 이용 동의]</strong><br/>
                                        1. 수집목적: 비교과 프로그램 신청 및 운영<br/>
                                        2. 수집항목: 학번, 성명, 학과, 학년, 연락처, 이메일<br/>
                                        3. 보유기간: 프로그램 종료 후 1년<br/>
                                        4. 동의거부권: 개인정보 수집에 동의하지 않을 권리가 있으나, 동의하지 않을 경우 신청이 제한될 수 있습니다.<br/>
                                        5. 제3자 제공: 원칙적으로 개인정보를 제3자에게 제공하지 않습니다.
                                    </div>
                                    
                                    <label className="privacy-checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="privacyAgree"
                                            checked={formData.privacyAgree}
                                            onChange={handleInputChange}
                                            required
                                            className="privacy-checkbox"
                                        />
                                        <span className="privacy-text">
                                            개인정보 수집 및 이용에 동의합니다 
                                            <span className="required">*</span>
                                        </span>
                                    </label>
                                </div>

                                {/* 제출 버튼 */}
                                <div className="form-buttons">
                                    <button 
                                        type="button"
                                        onClick={handleClose}
                                        disabled={loading}
                                        className="btn btn-cancel"
                                    >
                                        취소
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading || userLoading || !isSubmitEnabled}
                                        className={`btn btn-submit ${isSubmitEnabled ? 'enabled' : 'disabled'}`}
                                    >
                                        {loading ? '신청 처리 중...' : userLoading ? '정보 확인 중...' : '신청하기'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgramApplicationModal;