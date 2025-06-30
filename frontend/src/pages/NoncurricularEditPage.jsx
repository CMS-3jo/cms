import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Korean } from "flatpickr/dist/l10n/ko.js";
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import styles from '/public/css/NoncurricularRegisterPage.module.css';

const NoncurricularEditPage = () => {
    const navigate = useNavigate();
    const { prgId } = useParams();

    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        prgNm: '',
        prgDesc: '',
        prgStDt: null,
        prgEndDt: null,
        prgDeptCd: '',
        maxCnt: '',
        prgStatCd: '01',
        location: '',
        contactEmail: '',
        contactPhone: '',
        targetInfo: '',
        departmentInfo: '',
        gradeInfo: '',
        programSchedule: ''
    });

    // 기타 상태
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 컴포넌트 마운트 시 데이터 조회
    useEffect(() => {
        if (prgId) {
            fetchProgramData();
            fetchDepartments();
        }
    }, [prgId]);

    // --- 데이터 조회 함수들 ---

    const fetchProgramData = async () => {
        try {
            setDataLoading(true);
            const response = await fetch(`/api/noncur/${prgId}/edit`);
            if (response.ok) {
                const data = await response.json();
                console.log('수정용 프로그램 데이터:', data);
                
                // 날짜 변환
                const convertedData = {
                    ...data,
                    prgStDt: data.prgStDt ? new Date(data.prgStDt) : null,
                    prgEndDt: data.prgEndDt ? new Date(data.prgEndDt) : null
                };
                
                setFormData(convertedData);
            } else {
                console.error('프로그램 데이터 조회 실패');
                alert('프로그램 데이터를 불러올 수 없습니다.');
                navigate('/noncur');
            }
        } catch (error) {
            console.error('프로그램 데이터 조회 오류:', error);
            alert('프로그램 데이터 조회 중 오류가 발생했습니다.');
            navigate('/noncur');
        } finally {
            setDataLoading(false);
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

    // 수정 취소 핸들러
    const handleCancel = () => {
        if (window.confirm("수정을 취소하고 상세페이지로 돌아가시겠습니까?")) {
            navigate(`/noncur/${prgId}`);
        }
    };

    // --- 유틸리티 및 유효성 검사 함수들 ---

    const getFieldLabel = (field) => {
        const labels = {
            prgNm: '프로그램명', 
            prgDesc: '프로그램 소개', 
            prgStDt: '시작일', 
            prgEndDt: '종료일', 
            prgDeptCd: '운영부서', 
            maxCnt: '정원'
        };
        return labels[field] || field;
    };

    const validateForm = () => {
        const required = ['prgNm', 'prgDesc', 'prgStDt', 'prgEndDt', 'prgDeptCd', 'maxCnt'];
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
        return true;
    };

    const getCurrentUserId = async () => {
        try {
            const response = await fetch('/api/auth/me', { 
                method: 'GET', 
                credentials: 'include' 
            });
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

    // --- 폼 제출 함수 (수정용) ---

    const handleSubmit = async () => {
        if (loading) return;
        if (!validateForm()) return;

        try {
            setLoading(true);
            console.log('=== 수정 프로세스 시작 ===');
            
            // 사용자 ID 조회
            const currentUserId = await getCurrentUserId();
            console.log('현재 사용자 ID:', currentUserId);

            // 프로그램 데이터 수정 (PUT 요청)
            const programData = {
                ...formData,
                prgStDt: formData.prgStDt ? formData.prgStDt.toISOString() : null,
                prgEndDt: formData.prgEndDt ? formData.prgEndDt.toISOString() : null,
                modUserId: currentUserId
            };

            console.log('전송할 프로그램 데이터:', programData);

            const updateResponse = await fetch(`/api/noncur/${prgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(programData),
                credentials: 'include'
            });

            console.log('프로그램 수정 응답 상태:', updateResponse.status);

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                console.error('프로그램 수정 실패:', errorData);
                throw new Error(errorData.error || '프로그램 수정에 실패했습니다.');
            }

            const updateResult = await updateResponse.json();
            console.log('프로그램 수정 성공:', updateResult);

            // === 성공 처리 ===
            console.log('=== 수정 프로세스 완료 ===');
            alert('프로그램이 성공적으로 수정되었습니다.');
            
            // 상세 페이지로 이동
            navigate(`/noncur/${prgId}`);

        } catch (error) {
            console.error('=== 수정 프로세스 실패 ===');
            console.error('오류 상세:', error);
            alert(`프로그램 수정 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 데이터 로딩 중일 때 로딩 화면 표시
    if (dataLoading) {
        return (
            <>
                <Header />
                <div className={styles['ncr-container']}>
                    <div className={styles['ncr-page-title-bar']}>
                        <h2 className={styles['ncr-page-title']}>비교과 프로그램 수정</h2>
                    </div>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p>프로그램 데이터를 불러오는 중...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className={styles['ncr-container']}>
                <div className={styles['ncr-page-title-bar']}>
                    <h2 className={styles['ncr-page-title']}>비교과 프로그램 수정</h2>
                </div>

                <div className={styles['ncr-form-wrapper']}>
                    {/* 기본 정보 */}
                    <div className={styles['ncr-card']}>
                        <h3 className={styles['ncr-card-title']}>기본 정보</h3>
                        <div className={styles['ncr-form-group']}>
                            <label htmlFor="prgNm" className={styles['ncr-label']}>
                                프로그램명<span className={styles['ncr-required-star']}>*</span>
                            </label>
                            <input 
                                id="prgNm" 
                                type="text" 
                                name="prgNm" 
                                value={formData.prgNm} 
                                onChange={handleInputChange} 
                                className={styles['ncr-input']} 
                                placeholder="예: 파이썬 데이터 분석 입문" 
                            />
                        </div>
                        <div className={styles['ncr-form-group']}>
                            <label htmlFor="prgDesc" className={styles['ncr-label']}>
                                프로그램 소개<span className={styles['ncr-required-star']}>*</span>
                            </label>
                            <textarea 
                                id="prgDesc" 
                                name="prgDesc" 
                                value={formData.prgDesc} 
                                onChange={handleInputChange} 
                                rows="5" 
                                className={styles['ncr-textarea']} 
                                placeholder="학생들이 이해하기 쉽게 프로그램의 목적, 내용, 기대효과 등을 상세히 기술해주세요." 
                            />
                        </div>
                    </div>

                    {/* 프로그램 정보 */}
                    <div className={styles['ncr-card']}>
                        <h3 className={styles['ncr-card-title']}>프로그램 정보</h3>
                        <div className={styles['ncr-grid-3']}>
                            {/* 1행: 모집인원 */}
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="maxCnt" className={styles['ncr-label']}>
                                    모집인원(정원)<span className={styles['ncr-required-star']}>*</span>
                                </label>
                                <input 
                                    id="maxCnt" 
                                    type="number" 
                                    name="maxCnt" 
                                    value={formData.maxCnt} 
                                    onChange={handleInputChange} 
                                    min="1" 
                                    className={styles['ncr-input']} 
                                    placeholder="숫자만 입력" 
                                />
                            </div>
                            <div className={styles['ncr-form-group']}></div>
                            <div className={styles['ncr-form-group']}></div>

                            {/* 2행: 학적 | 학과 | 학년 */}
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="targetInfo" className={styles['ncr-label']}>학적</label>
                                <input 
                                    id="targetInfo" 
                                    type="text" 
                                    name="targetInfo" 
                                    value={formData.targetInfo} 
                                    onChange={handleInputChange} 
                                    className={styles['ncr-input']} 
                                    placeholder="예: 재학생,졸업생" 
                                />
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="departmentInfo" className={styles['ncr-label']}>학과</label>
                                <input 
                                    id="departmentInfo" 
                                    type="text" 
                                    name="departmentInfo" 
                                    value={formData.departmentInfo} 
                                    onChange={handleInputChange} 
                                    className={styles['ncr-input']} 
                                    placeholder="예: 인문사회과학대학" 
                                />
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="gradeInfo" className={styles['ncr-label']}>학년</label>
                                <input 
                                    id="gradeInfo" 
                                    type="text" 
                                    name="gradeInfo" 
                                    value={formData.gradeInfo} 
                                    onChange={handleInputChange} 
                                    className={styles['ncr-input']} 
                                    placeholder="예: 3, 4학년" 
                                />
                            </div>

                            {/* 3행: 시작일시 | 종료일시 | (빈 공간) */}
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="prgStDt" className={styles['ncr-label']}>
                                    시작일시<span className={styles['ncr-required-star']}>*</span>
                                </label>
                                <Flatpickr 
                                    id="prgStDt" 
                                    value={formData.prgStDt} 
                                    onChange={(dates) => handleDateChange('prgStDt', dates)} 
                                    options={{ 
                                        locale: Korean, 
                                        enableTime: true, 
                                        dateFormat: 'Y-m-d H:i', 
                                        minDate: new Date() 
                                    }} 
                                    className={styles['ncr-input']} 
                                    placeholder="클릭하여 날짜 선택" 
                                />
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="prgEndDt" className={styles['ncr-label']}>
                                    종료일시<span className={styles['ncr-required-star']}>*</span>
                                </label>
                                <Flatpickr 
                                    id="prgEndDt" 
                                    value={formData.prgEndDt} 
                                    onChange={(dates) => handleDateChange('prgEndDt', dates)} 
                                    options={{ 
                                        locale: Korean, 
                                        enableTime: true, 
                                        dateFormat: 'Y-m-d H:i', 
                                        minDate: formData.prgStDt || new Date() 
                                    }} 
                                    className={styles['ncr-input']} 
                                    placeholder="클릭하여 날짜 선택" 
                                />
                            </div>
                            <div className={styles['ncr-form-group']}></div> {/* 빈 공간 */}
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
                                <select 
                                    id="prgDeptCd" 
                                    name="prgDeptCd" 
                                    value={formData.prgDeptCd} 
                                    onChange={handleInputChange} 
                                    className={styles['ncr-select']}
                                >
                                    <option value="">부서 선택</option>
                                    {departments.map(dept => 
                                        <option key={dept.deptCd} value={dept.deptCd}>{dept.deptNm}</option>
                                    )}
                                </select>
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="location" className={styles['ncr-label']}>교육 장소</label>
                                <input 
                                    id="location" 
                                    type="text" 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleInputChange} 
                                    className={styles['ncr-input']} 
                                    placeholder="예: 공학관 101호 또는 온라인(Zoom)" 
                                />
                            </div>
                            <div className={styles['ncr-form-group']}></div> {/* For grid alignment */}
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="contactEmail" className={styles['ncr-label']}>문의 이메일</label>
                                <input 
                                    id="contactEmail" 
                                    type="email" 
                                    name="contactEmail" 
                                    value={formData.contactEmail} 
                                    onChange={handleInputChange} 
                                    className={styles['ncr-input']} 
                                    placeholder="contact@example.com" 
                                />
                            </div>
                            <div className={styles['ncr-form-group']}>
                                <label htmlFor="contactPhone" className={styles['ncr-label']}>문의 연락처</label>
                                <input 
                                    id="contactPhone" 
                                    type="tel" 
                                    name="contactPhone" 
                                    value={formData.contactPhone} 
                                    onChange={handleInputChange} 
                                    className={styles['ncr-input']} 
                                    placeholder="02-1234-5678" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* 세부 정보 */}
                    <div className={styles['ncr-card']}>
                        <h3 className={styles['ncr-card-title']}>세부 정보</h3>
                        <div className={styles['ncr-form-group']}>
                            <label htmlFor="programSchedule" className={styles['ncr-label']}>세부 일정</label>
                            <textarea 
                                id="programSchedule" 
                                name="programSchedule" 
                                value={formData.programSchedule} 
                                onChange={handleInputChange} 
                                rows="4" 
                                className={styles['ncr-textarea']} 
                                placeholder="주차별 교육 내용, 특별활동 등 상세 일정을 자유롭게 기입해주세요." 
                            />
                        </div>
                    </div>

                    {/* 수정/취소 버튼 영역 */}
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
                            {loading ? '처리 중...' : '수정하기'}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default NoncurricularEditPage;