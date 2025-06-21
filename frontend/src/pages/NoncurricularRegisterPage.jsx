import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위해 import
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Korean } from "flatpickr/dist/l10n/ko.js";
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import styles from '/public/css/NoncurricularRegisterPage.module.css';

const NoncurricularRegisterPage = () => {
    // React Router의 navigate 함수 초기화
    const navigate = useNavigate();

    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        prgNm: '',
        prgDesc: '',
        prgStDt: null,
        prgEndDt: null,
        prgDeptCd: '',
        maxCnt: '',
        prgStatCd: '01', // 기본값: 모집중
        location: '',
        contactEmail: '',
        contactPhone: '',
        targetInfo: '',
        departmentInfo: '',
        gradeInfo: '',
        programSchedule: '',
        mlgScore: '',
        selectedCompetencies: []
    });

    // 기타 상태
    const [allCompetencies, setAllCompetencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [attachFiles, setAttachFiles] = useState([]);
    const [thumbnailFiles, setThumbnailFiles] = useState([]);
    const [fileCategories, setFileCategories] = useState([]);

    // 컴포넌트 마운트 시 데이터 조회
    useEffect(() => {
        fetchCompetencies();
        fetchDepartments();
        fetchFileCategories();
    }, []);

    // --- 데이터 조회 함수들 ---
    
    const fetchFileCategories = async () => {
        try {
            const response = await fetch('/api/common/codes?group=FILE_CATEGORY');
            if (response.ok) {
                const data = await response.json();
                setFileCategories(data || []);
            }
        } catch (error) {
            console.error('파일 카테고리 조회 실패:', error);
        }
    };

    const fetchCompetencies = async () => {
        try {
            const response = await fetch('/api/noncur/competencies');
            if (response.ok) {
                const data = await response.json();
                setAllCompetencies(data.competencies || []);
            }
        } catch (error) {
            console.error('핵심역량 조회 실패:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/noncur/departments');
            if (response.ok) {
                const departmentsData = await response.json();
                setDepartments(departmentsData);
            } else {
                console.error('부서 목록 조회 실패, 기본값으로 설정합니다.');
                setDepartments([
                    { deptCd: 'S_BUSINESS', deptNm: '경영학과' },
                    { deptCd: 'S_CHEM', deptNm: '토목공학과' },
                    { deptCd: 'S_COMPUTER', deptNm: '컴퓨터공학과' },
                    { deptCd: 'S_ELEC', deptNm: '전자공학과' }
                ]);
            }
        } catch (error) {
            console.error('부서 목록 조회 오류:', error);
            setDepartments([
                { deptCd: 'S_BUSINESS', deptNm: '경영학과' },
                { deptCd: 'S_CHEM', deptNm: '토목공학과' },
                { deptCd: 'S_COMPUTER', deptNm: '컴퓨터공학과' },
                { deptCd: 'S_ELEC', deptNm: '전자공학과' }
            ]);
        }
    };

    // --- 이벤트 핸들러 함수들 ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, dates) => {
        setFormData(prev => ({ ...prev, [name]: dates[0] || null }));
    };

    const handleCompetencyToggle = (competencyId) => {
        setFormData(prev => ({
            ...prev,
            selectedCompetencies: prev.selectedCompetencies.includes(competencyId)
                ? prev.selectedCompetencies.filter(id => id !== competencyId)
                : [...prev.selectedCompetencies, competencyId]
        }));
    };
    
    const handleAttachFileChange = (event) => {
        setAttachFiles(Array.from(event.target.files));
    };

    const handleThumbnailFileChange = (event) => {
        setThumbnailFiles(Array.from(event.target.files));
    };
    
    const handleCancel = () => {
        if (window.confirm("작성을 취소하고 목록으로 돌아가시겠습니까?")) {
            navigate('/noncur'); // 목록 페이지로 이동
        }
    };

    // --- 유틸리티 및 유효성 검사 함수들 ---

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const getFieldLabel = (field) => {
        const labels = {
            prgNm: '프로그램명', prgDesc: '프로그램 소개', prgStDt: '시작일', 
            prgEndDt: '종료일', prgDeptCd: '운영부서', maxCnt: '정원', mlgScore: '마일리지 점수'
        };
        return labels[field] || field;
    };

    const validateForm = () => {
        const required = ['prgNm', 'prgDesc', 'prgStDt', 'prgEndDt', 'prgDeptCd', 'maxCnt', 'mlgScore'];
        for (let field of required) {
            if (!formData[field]) {
                alert(`${getFieldLabel(field)}은(는) 필수 입력 항목입니다.`);
                return false;
            }
        }
        if (formData.prgStDt >= formData.prgEndDt) {
            alert('종료일은 시작일보다 늦어야 합니다.');
            return false;
        }
        if (formData.mlgScore <= 0) {
            alert('마일리지 점수는 0보다 커야 합니다.');
            return false;
        }
        return true;
    };
    
    const validateFiles = (files, type) => {
        const maxSize = type === 'thumbnail' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 썸네일 10MB, 첨부파일 50MB
        const allowedExtensions = type === 'thumbnail' 
            ? ['jpg', 'jpeg', 'png', 'gif', 'bmp']
            : ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'hwp', 'zip', 'rar'];

        for (let file of files) {
            if (file.size > maxSize) {
                alert(`파일 크기가 제한을 초과했습니다: ${file.name} (최대: ${formatFileSize(maxSize)})`);
                return false;
            }
            const extension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(extension)) {
                alert(`허용되지 않은 파일 형식입니다: ${file.name} (허용: ${allowedExtensions.join(', ')})`);
                return false;
            }
        }
        return true;
    };
    
    const getCurrentUserId = async () => {
        try {
            const response = await fetch('/api/auth/me', { method: 'GET', credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                return data.userId;
            } else {
                throw new Error('사용자 인증 실패');
            }
        } catch (error) {
            console.error('사용자 ID 조회 실패:', error);
            throw error;
        }
    };
    
    // --- 폼 제출 함수 ---

    const handleSubmit = async () => {
        if (loading) return;
        if (!validateForm()) return;

        try {
            setLoading(true);
            const currentUserId = await getCurrentUserId();
            const prgId = 'PRG' + new Date().getTime().toString().slice(-10);
            
            // 파일 유효성 검사
            if (attachFiles.length > 0 && !validateFiles(attachFiles, 'attach')) return;
            if (thumbnailFiles.length > 0 && !validateFiles(thumbnailFiles, 'thumbnail')) return;

            const hasFiles = attachFiles.length > 0 || thumbnailFiles.length > 0;

            if (hasFiles) {
                // 파일이 있을 경우 FormData로 전송
                const formDataToSend = new FormData();
                const programData = {
                    prgId, ...formData,
                    prgStDt: formData.prgStDt ? formData.prgStDt.toISOString() : null,
                    prgEndDt: formData.prgEndDt ? formData.prgEndDt.toISOString() : null,
                    regUserId: currentUserId
                };
                formDataToSend.append('program', new Blob([JSON.stringify(programData)], { type: 'application/json' }));
                attachFiles.forEach(file => formDataToSend.append('attachFiles', file));
                thumbnailFiles.forEach(file => formDataToSend.append('thumbnailFiles', file));
                
                const response = await fetch('/api/noncur/register-with-files', {
                    method: 'POST', body: formDataToSend, credentials: 'include'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '등록에 실패했습니다.');
                }
            } else {
                // 파일이 없을 경우 JSON으로 전송
                const programData = {
                    prgId, ...formData,
                    prgStDt: formData.prgStDt ? formData.prgStDt.toISOString() : null,
                    prgEndDt: formData.prgEndDt ? formData.prgEndDt.toISOString() : null,
                    regUserId: currentUserId
                };
                
                const registerResponse = await fetch('/api/noncur/register', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(programData), credentials: 'include'
                });

                if (!registerResponse.ok) throw new Error('프로그램 등록에 실패했습니다.');

                if (formData.mlgScore > 0) {
                    await fetch(`/api/mileage/program/${prgId}?mlgScore=${formData.mlgScore}&regUserId=${currentUserId}`, {
                        method: 'POST', credentials: 'include'
                    });
                }

                if (formData.selectedCompetencies.length > 0) {
                    const competencyPromises = formData.selectedCompetencies.map(cciId =>
                        fetch('/api/noncur/competency-mapping', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prgId, cciId }), credentials: 'include'
                        })
                    );
                    await Promise.all(competencyPromises);
                }
            }

            alert('프로그램이 성공적으로 등록되었습니다.');
            navigate('/noncur'); // 목록 페이지로 이동

        } catch (error) {
            console.error('등록 중 오류:', error);
            alert(`프로그램 등록 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Header />
            <div className={styles['ncr-container']}>
                <div className={styles['ncr-page-title-bar']}>
                    <h2 className={styles['ncr-page-title']}>비교과 프로그램 등록</h2>
                </div>

                <div className={styles['ncr-form-wrapper']}>
                    {/* 기본 정보 */}
                    <div className={styles['ncr-card']}>
                        <h3 className={styles['ncr-card-title']}>기본 정보</h3>
                        <div className={styles['ncr-form-group']}>
                            <label htmlFor="prgNm" className={styles['ncr-label']}>
                                프로그램명<span className={styles['ncr-required-star']}>*</span>
                            </label>
                            <input id="prgNm" type="text" name="prgNm" value={formData.prgNm} onChange={handleInputChange} className={styles['ncr-input']} placeholder="예: 파이썬 데이터 분석 입문" />
                        </div>
                        <div className={styles['ncr-form-group']}>
                            <label htmlFor="prgDesc" className={styles['ncr-label']}>
                                프로그램 소개<span className={styles['ncr-required-star']}>*</span>
                            </label>
                            <textarea id="prgDesc" name="prgDesc" value={formData.prgDesc} onChange={handleInputChange} rows="5" className={styles['ncr-textarea']} placeholder="학생들이 이해하기 쉽게 프로그램의 목적, 내용, 기대효과 등을 상세히 기술해주세요." />
                        </div>
                    </div>

                    {/* 핵심역량 매핑 */}
                    <div className={styles['ncr-card']}>
                        <h3 className={styles['ncr-card-title']}>핵심역량 매핑</h3>
                        <p className={styles['ncr-card-description']}>이 프로그램과 관련된 핵심역량을 모두 선택해주세요.</p>
                        <div className={styles['ncr-competency-grid']}>
                            {allCompetencies.map((competency) => (
                                <div
                                    key={competency.cciId}  
                                    onClick={() => handleCompetencyToggle(competency.cciId)} 
                                    className={`${styles['ncr-competency-item']} ${formData.selectedCompetencies.includes(competency.cciId) ? styles.selected : ''}`}
                                >
                                    {competency.cciNm}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 프로그램 정보 */}
                    <div className={styles['ncr-card']}>
                        <h3 className={styles['ncr-card-title']}>프로그램 정보</h3>
                        <div className={styles['ncr-grid-3']}>
                             <div className={styles['ncr-form-group']}>
                                <label htmlFor="maxCnt" className={styles['ncr-label']}>
                                    모집인원(정원)<span className={styles['ncr-required-star']}>*</span>
                                </label>
                                <input id="maxCnt" type="number" name="maxCnt" value={formData.maxCnt} onChange={handleInputChange} min="1" className={styles['ncr-input']} placeholder="숫자만 입력" />
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="targetInfo" className={styles['ncr-label']}>모집 대상</label>
                                <input id="targetInfo" type="text" name="targetInfo" value={formData.targetInfo} onChange={handleInputChange} className={styles['ncr-input']} placeholder="예: 3, 4학년 재학생" />
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="mlgScore" className={styles['ncr-label']}>
                                    지급 마일리지<span className={styles['ncr-required-star']}>*</span>
                                </label>
                                <input id="mlgScore" type="number" name="mlgScore" value={formData.mlgScore} onChange={handleInputChange} min="0" step="0.1" className={styles['ncr-input']} placeholder="예: 10.5" />
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="prgStDt" className={styles['ncr-label']}>
                                    시작일시<span className={styles['ncr-required-star']}>*</span>
                                </label>
                                <Flatpickr id="prgStDt" value={formData.prgStDt} onChange={(dates) => handleDateChange('prgStDt', dates)} options={{ locale: Korean, enableTime: true, dateFormat: 'Y-m-d H:i', minDate: new Date() }} className={styles['ncr-input']} placeholder="클릭하여 날짜 선택" />
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="prgEndDt" className={styles['ncr-label']}>
                                    종료일시<span className={styles['ncr-required-star']}>*</span>
                                </label>
                                <Flatpickr id="prgEndDt" value={formData.prgEndDt} onChange={(dates) => handleDateChange('prgEndDt', dates)} options={{ locale: Korean, enableTime: true, dateFormat: 'Y-m-d H:i', minDate: formData.prgStDt || new Date() }} className={styles['ncr-input']} placeholder="클릭하여 날짜 선택" />
                            </div>
                        </div>
                    </div>

                    {/* 운영 정보 */}
                    <div className={styles['ncr-card']}>
                         <h3 className={styles['ncr-card-title']}>운영 정보</h3>
                         <div className={styles['ncr-grid-3']}>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="prgDeptCd" className={styles['ncr-label']}>
                                    운영부서<span className={styles['ncr-required-star']}>*</span>
                                </label>
                                <select id="prgDeptCd" name="prgDeptCd" value={formData.prgDeptCd} onChange={handleInputChange} className={styles['ncr-select']}>
                                    <option value="">부서 선택</option>
                                    {departments.map(dept => <option key={dept.deptCd} value={dept.deptCd}>{dept.deptNm}</option>)}
                                </select>
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="location" className={styles['ncr-label']}>교육 장소</label>
                                <input id="location" type="text" name="location" value={formData.location} onChange={handleInputChange} className={styles['ncr-input']} placeholder="예: 공학관 101호 또는 온라인(Zoom)" />
                            </div>
                             <div className={styles['ncr-form-group']}></div> {/* For grid alignment */}
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="contactEmail" className={styles['ncr-label']}>문의 이메일</label>
                                <input id="contactEmail" type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className={styles['ncr-input']} placeholder="contact@example.com" />
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="contactPhone" className={styles['ncr-label']}>문의 연락처</label>
                                <input id="contactPhone" type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className={styles['ncr-input']} placeholder="02-1234-5678" />
                            </div>
                         </div>
                    </div>

                    {/* 세부 정보 및 파일 첨부 */}
                    <div className={styles['ncr-card']}>
                         <h3 className={styles['ncr-card-title']}>세부 정보 및 파일 첨부</h3>
                         <div className={styles['ncr-form-group']}>
                            <label htmlFor="programSchedule" className={styles['ncr-label']}>세부 일정</label>
                            <textarea id="programSchedule" name="programSchedule" value={formData.programSchedule} onChange={handleInputChange} rows="4" className={styles['ncr-textarea']} placeholder="주차별 교육 내용, 특별활동 등 상세 일정을 자유롭게 기입해주세요." />
                        </div>
                        
                        <div className={styles['ncr-form-group']}>
                            <label className={styles['ncr-label']}>첨부파일 (선택)</label>
                            <label htmlFor="attach-files" className={styles['ncr-file-dropzone']}>
                                <span>클릭하여 파일 선택</span>
                                <small>각 50MB 이하, 다중 선택 가능</small>
                            </label>
                            <input id="attach-files" type="file" multiple onChange={handleAttachFileChange} className={styles['ncr-file-input']} accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.hwp,.zip,.rar" />
                            {attachFiles.length > 0 && (
                                <div className={styles['ncr-file-list']}>
                                    {attachFiles.map((file, index) => <div key={index} className={styles['ncr-file-item']}>📄 {file.name} ({formatFileSize(file.size)})</div>)}
                                </div>
                            )}
                        </div>
                         <div className={styles['ncr-form-group']}>
                            <label className={styles['ncr-label']}>썸네일 이미지 (선택)</label>
                            <label htmlFor="thumbnail-files" className={styles['ncr-file-dropzone']}>
                                <span>클릭하여 이미지 선택</span>
                                <small>10MB 이하 이미지 파일 (목록 페이지에 표시됩니다)</small>
                            </label>
                            <input id="thumbnail-files" type="file" onChange={handleThumbnailFileChange} className={styles['ncr-file-input']} accept="image/*" />
                             {thumbnailFiles.length > 0 && (
                                <div className={styles['ncr-file-list']}>
                                    {thumbnailFiles.map((file, index) => <div key={index} className={styles['ncr-file-item']}>🖼️ {file.name} ({formatFileSize(file.size)})</div>)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 등록/취소 버튼 영역 */}
                    <div className={styles['ncr-action-buttons']}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={`${styles['ncr-button']} ${styles['ncr-cancel-button']}`}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`${styles['ncr-button']} ${styles['ncr-submit-button']}`}
                        >
                            {loading ? '처리 중...' : '등록하기'}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default NoncurricularRegisterPage;