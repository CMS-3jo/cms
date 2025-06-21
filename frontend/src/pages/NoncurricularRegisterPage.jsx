import React, { useState, useEffect } from 'react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Korean } from "flatpickr/dist/l10n/ko.js";
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import styles from '/public/css/NoncurricularRegisterPage.module.css'; // CSS 모듈 임포트

const NoncurricularRegisterPage = () => {
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
        mlgScore: '', // 마일리지 점수 추가
        selectedCompetencies: [] // 선택된 핵심역량
    });

    const [allCompetencies, setAllCompetencies] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [attachFiles, setAttachFiles] = useState([]); // 첨부파일
    const [thumbnailFiles, setThumbnailFiles] = useState([]); // 썸네일 파일
    const [fileCategories, setFileCategories] = useState([]); // 파일 카테고리 목록

    useEffect(() => {
        fetchCompetencies();
        fetchDepartments();
        fetchFileCategories(); // 파일 카테고리
    }, []);

    // 파일 카테고리 조회
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

    // 첨부파일 변경 핸들러
    const handleAttachFileChange = (event) => {
        const files = Array.from(event.target.files);
        setAttachFiles(files);
    };

    // 썸네일 파일 변경 핸들러
    const handleThumbnailFileChange = (event) => {
        const files = Array.from(event.target.files);
        setThumbnailFiles(files);
    };

    // 파일 크기 포맷팅
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 파일 유효성 검사
    const validateFiles = (files, type) => {
        const maxSize = type === 'thumbnail' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 썸네일 10MB, 첨부파일 50MB
        const allowedExtensions = type === 'thumbnail' 
            ? ['jpg', 'jpeg', 'png', 'gif', 'bmp']
            : ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'hwp', 'zip', 'rar'];

        for (let file of files) {
            // 파일 크기 검사
            if (file.size > maxSize) {
                alert(`파일 크기가 제한을 초과했습니다: ${file.name} (최대: ${formatFileSize(maxSize)})`);
                return false;
            }

            // 확장자 검사
            const extension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(extension)) {
                alert(`허용되지 않은 파일 형식입니다: ${file.name} (허용: ${allowedExtensions.join(', ')})`);
                return false;
            }
        }
        return true;
    };

    // 파일만 별도로 업로드하는 함수 (필요시)
    const uploadFilesOnly = async (prgId, files, category) => {
        const formData = new FormData();
        
        files.forEach(file => {
            formData.append('files', file);
        });
        
        formData.append('refType', 'NONCUR');
        formData.append('refId', prgId);
        formData.append('category', category);

        try {
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                console.log('파일 업로드 성공:', result);
                return result;
            } else {
                throw new Error('파일 업로드 실패');
            }
        } catch (error) {
            console.error('파일 업로드 오류:', error);
            throw error;
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
                const departments = await response.json();
                setDepartments(departments);
            } else {
                console.error('부서 목록 조회 실패');
                // 실패 시 기본값 설정
                setDepartments([
                    { deptCd: 'S_BUSINESS', deptNm: '경영학과' },
                    { deptCd: 'S_CHEM', deptNm: '토목공학과' },
                    { deptCd: 'S_COMPUTER', deptNm: '컴퓨터공학과' },
                    { deptCd: 'S_ELEC', deptNm: '전자공학과' }
                ]);
            }
        } catch (error) {
            console.error('부서 목록 조회 오류:', error);
            // 오류 시 기본값 설정
            setDepartments([
                { deptCd: 'S_BUSINESS', deptNm: '경영학과' },
                { deptCd: 'S_CHEM', deptNm: '토목공학과' },
                { deptCd: 'S_COMPUTER', deptNm: '컴퓨터공학과' },
                { deptCd: 'S_ELEC', deptNm: '전자공학과' }
            ]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (name, dates) => {
        setFormData(prev => ({
            ...prev,
            [name]: dates[0] || null
        }));
    };

    const handleCompetencyToggle = (competencyId) => {
        setFormData(prev => ({
            ...prev,
            selectedCompetencies: prev.selectedCompetencies.includes(competencyId)
                ? prev.selectedCompetencies.filter(id => id !== competencyId)
                : [...prev.selectedCompetencies, competencyId]
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(files);
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

    const getFieldLabel = (field) => {
        const labels = {
            prgNm: '프로그램명',
            prgDesc: '프로그램 소개',
            prgStDt: '시작일',
            prgEndDt: '종료일',
            prgDeptCd: '운영부서',
            maxCnt: '정원',
            mlgScore: '마일리지 점수'
        };
        return labels[field] || field;
    };

    const generateProgramId = () => {
        return 'PRG' + new Date().getTime().toString().slice(-10);
    };

    // 현재 로그인한 사용자 ID 가져오기
    const getCurrentUserId = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include' // 쿠키 포함
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

    // 통합된 handleSubmit 함수 (파일 첨부 선택적)
    const handleSubmit = async () => {
        if (loading) return;

        // 폼 유효성 검사
        if (!validateForm()) return;

        try {
            setLoading(true);

            // 현재 로그인한 사용자 ID 가져오기
            const currentUserId = await getCurrentUserId();

            // 파일 유효성 검사 (파일이 있는 경우에만)
            if (attachFiles.length > 0 && !validateFiles(attachFiles, 'attach')) {
                return;
            }
            if (thumbnailFiles.length > 0 && !validateFiles(thumbnailFiles, 'thumbnail')) {
                return;
            }

            const prgId = generateProgramId();

            // 파일이 있는 경우 FormData 사용, 없는 경우 JSON 사용
            const hasFiles = attachFiles.length > 0 || thumbnailFiles.length > 0;

            if (hasFiles) {
                // 파일이 있는 경우: FormData 사용
                const formDataToSend = new FormData();

                // JSON 데이터 추가 (Blob으로 변환)
                const programData = {
                    prgId,
                    ...formData,
                    prgStDt: formData.prgStDt ? formData.prgStDt.toISOString() : null,
                    prgEndDt: formData.prgEndDt ? formData.prgEndDt.toISOString() : null,
                    regUserId: currentUserId // API에서 받아온 사용자 ID
                };
                
                formDataToSend.append('program', new Blob([JSON.stringify(programData)], {
                    type: 'application/json'
                }));

                // 첨부파일 추가
                attachFiles.forEach(file => {
                    formDataToSend.append('attachFiles', file);
                });

                // 썸네일 파일 추가
                thumbnailFiles.forEach(file => {
                    formDataToSend.append('thumbnailFiles', file);
                });

                // API 호출 (파일 포함)
                const response = await fetch('/api/noncur/register-with-files', {
                    method: 'POST',
                    body: formDataToSend,
                    credentials: 'include' // 쿠키 포함
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('프로그램이 성공적으로 등록되었습니다!');
                    console.log('등록된 프로그램 ID:', result.prgId);
                } else {
                    const error = await response.json();
                    throw new Error(error.error || '등록에 실패했습니다.');
                }

            } else {
                // 파일이 없는 경우: JSON만 사용
                const programData = {
                    prgId,
                    ...formData,
                    prgStDt: formData.prgStDt ? formData.prgStDt.toISOString() : null,
                    prgEndDt: formData.prgEndDt ? formData.prgEndDt.toISOString() : null,
                    regUserId: currentUserId // API에서 받아온 사용자 ID
                };

                // 1. 프로그램 기본 정보 등록
                const registerResponse = await fetch('/api/noncur/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(programData),
                    credentials: 'include' // 쿠키 포함
                });

                if (!registerResponse.ok) {
                    throw new Error('프로그램 등록에 실패했습니다.');
                }

                // 2. 마일리지 설정
                if (formData.mlgScore > 0) {
                    const mileageResponse = await fetch(`/api/mileage/program/${prgId}?mlgScore=${formData.mlgScore}&regUserId=${currentUserId}`, {
                        method: 'POST',
                        credentials: 'include' // 쿠키 포함
                    });

                    if (!mileageResponse.ok) {
                        console.warn('마일리지 설정에 실패했습니다.');
                    }
                }

                // 3. 핵심역량 매핑
                if (formData.selectedCompetencies.length > 0) {
                    const competencyPromises = formData.selectedCompetencies.map(cciId =>
                        fetch('/api/noncur/competency-mapping', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ prgId, cciId }),
                            credentials: 'include' // 쿠키 포함
                        })
                    );

                    await Promise.all(competencyPromises);
                }

                alert('프로그램이 성공적으로 등록되었습니다.');
            }

            // 성공 후 폼 초기화
            setFormData({
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
                programSchedule: '',
                mlgScore: '',
                selectedCompetencies: []
            });
            setAttachments([]);
            setAttachFiles([]);
            setThumbnailFiles([]);

            // 성공 후 페이지 이동 (필요시)
            // navigate('/noncur/list');

        } catch (error) {
            console.error('등록 중 오류:', error);
            alert('프로그램 등록 중 오류가 발생했습니다: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className={styles.mainContentContainer}>

                <Sidebar /> 
                
                <div className={styles.formContainer}>
                    <h3 className={styles.title}>
                        비교과 프로그램 등록
                    </h3>

                    <div className={styles.formGrid}>
                        {/* 기본 정보 */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>📋 기본 정보</h4>
                            
                            <div className={styles.gridTwoColumns}>
                                <div>
                                    <label className={styles.label}>
                                        프로그램명 *
                                    </label>
                                    <input
                                        type="text"
                                        name="prgNm"
                                        value={formData.prgNm}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="프로그램명을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label className={styles.label}>
                                        운영부서 *
                                    </label>
                                    <select
                                        name="prgDeptCd"
                                        value={formData.prgDeptCd}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    >
                                        <option value="">부서 선택</option>
                                        {departments.map(dept => (
                                            <option key={dept.deptCd} value={dept.deptCd}>
                                                {dept.deptNm}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.marginTop20}>
                                <label className={styles.label}>
                                    프로그램 소개 *
                                </label>
                                <textarea
                                    name="prgDesc"
                                    value={formData.prgDesc}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className={styles.textarea}
                                    placeholder="프로그램에 대한 상세한 설명을 입력하세요"
                                />
                            </div>
                        </div>

                        {/* 일정 및 정원 */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>📅 일정 및 정원</h4>
                            
                            <div className={styles.gridThreeColumns}>
                                <div>
                                    <label className={styles.label}>
                                        교육 시작일 *
                                    </label>
                                    <Flatpickr
                                        value={formData.prgStDt}
                                        onChange={(dates) => handleDateChange('prgStDt', dates)}
                                        options={{
                                            locale: Korean,
                                            enableTime: true,
                                            dateFormat: 'Y-m-d H:i',
                                            minDate: new Date()
                                        }}
                                        className={styles.input}
                                        placeholder="시작일을 선택하세요"
                                    />
                                </div>

                                <div>
                                    <label className={styles.label}>
                                        교육 종료일 *
                                    </label>
                                    <Flatpickr
                                        value={formData.prgEndDt}
                                        onChange={(dates) => handleDateChange('prgEndDt', dates)}
                                        options={{
                                            locale: Korean,
                                            enableTime: true,
                                            dateFormat: 'Y-m-d H:i',
                                            minDate: formData.prgStDt || new Date()
                                        }}
                                        className={styles.input}
                                        placeholder="종료일을 선택하세요"
                                    />
                                </div>

                                <div>
                                    <label className={styles.label}>
                                        정원 *
                                    </label>
                                    <input
                                        type="number"
                                        name="maxCnt"
                                        value={formData.maxCnt}
                                        onChange={handleInputChange}
                                        min="1"
                                        className={styles.input}
                                        placeholder="정원"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 마일리지 */}
                        <div className={`${styles.section} ${styles.mileageSection}`}>
                            <h4 className={`${styles.sectionTitle} ${styles.mileageTitle}`}>⭐ 마일리지 설정</h4>
                            
                            <div className={styles.mileageGrid}>
                                <div>
                                    <label className={styles.label}>
                                        마일리지 점수 *
                                    </label>
                                    <input
                                        type="number"
                                        name="mlgScore"
                                        value={formData.mlgScore}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.1"
                                        className={styles.input}
                                        placeholder="0.0"
                                    />
                                </div>
                                <div className={styles.mileageInfo}>
                                    💡 프로그램 이수완료 시 학생에게 부여될 마일리지 점수입니다.
                                </div>
                            </div>
                        </div>

                        {/* 핵심역량 */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>🎯 핵심역량 선택</h4>
                            
                            <div className={styles.competencyGrid}>
                                {allCompetencies.map((competency) => (
                                <div
                                    key={competency.cciId}  
                                    onClick={() => handleCompetencyToggle(competency.cciId)} 
                                    className={`${styles.competencyItem} ${formData.selectedCompetencies.includes(competency.cciId) ? styles.selected : ''}`}
                                >
                                    {competency.cciNm}  
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* 연락처 및 대상 */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>📞 연락처 및 대상 정보</h4>
                            
                            <div className={styles.gridTwoColumns}>
                                <div>
                                    <label className={styles.label}>장소</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="진행 장소"
                                    />
                                </div>

                                <div>
                                    <label className={styles.label}>문의 이메일</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="연락처 이메일"
                                    />
                                </div>

                                <div>
                                    <label className={styles.label}>문의 전화</label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="연락처 전화번호"
                                    />
                                </div>

                                <div>
                                    <label className={styles.label}>대상</label>
                                    <input
                                        type="text"
                                        name="targetInfo"
                                        value={formData.targetInfo}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="대상 정보 (예: 전체 학생)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 세부 일정 */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>📝 세부 정보</h4>
                            
                            <div>
                                <label className={styles.label}>
                                    세부 일정
                                </label>
                                <textarea
                                    name="programSchedule"
                                    value={formData.programSchedule}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className={styles.textarea}
                                    placeholder="프로그램 세부 일정을 입력하세요 (예: 오리엔테이션, 워크숍, 발표 등)"
                                />
                            </div>
                        </div>

                       {/* 첨부파일 섹션 */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>📎 첨부파일 (선택사항)</h4>
                            <input
                                type="file"
                                multiple
                                onChange={handleAttachFileChange}
                                className={styles.input}
                                accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.hwp,.zip,.rar"
                            />
                            {attachFiles.length > 0 && (
                                <div className={styles.fileList}>
                                    <h5>선택된 첨부파일:</h5>
                                    {attachFiles.map((file, index) => (
                                        <div key={index} className={styles.fileItem}>
                                            📄 {file.name} ({formatFileSize(file.size)})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 썸네일 파일 섹션 */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>🖼️ 썸네일 이미지 (선택사항)</h4>
                            <input
                                type="file"
                                multiple
                                onChange={handleThumbnailFileChange}
                                className={styles.input}
                                accept="image/*"
                            />
                            {thumbnailFiles.length > 0 && (
                                <div className={styles.fileList}>
                                    <h5>선택된 썸네일:</h5>
                                    {thumbnailFiles.map((file, index) => (
                                        <div key={index} className={styles.fileItem}>
                                            🖼️ {file.name} ({formatFileSize(file.size)})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 등록 버튼 */}
                        <div className={styles.submitContainer}>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={styles.submitButton}
                            >
                                {loading ? '등록 중...' : '프로그램 등록'}
                            </button>
                        </div>
                    </div>
                </div>
            
            </main>
            <Footer />
        </>
    );
};

export default NoncurricularRegisterPage;