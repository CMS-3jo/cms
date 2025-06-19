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

    useEffect(() => {
        fetchCompetencies();
        fetchDepartments();
    }, []);

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

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const prgId = generateProgramId();
            
            // 1. 프로그램 기본 정보 등록
            const programData = {
                prgId,
                ...formData,
                prgStDt: formData.prgStDt ? formData.prgStDt.toISOString() : null,
                prgEndDt: formData.prgEndDt ? formData.prgEndDt.toISOString() : null,
                regUserId: 'ADMIN001' // 실제로는 로그인한 사용자 ID
            };

            const registerResponse = await fetch('/api/noncur/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(programData)
            });

            if (!registerResponse.ok) {
                throw new Error('프로그램 등록에 실패했습니다.');
            }

            // 2. 마일리지 설정
            if (formData.mlgScore > 0) {
                const mileageResponse = await fetch(`/api/mileage/program/${prgId}?mlgScore=${formData.mlgScore}&regUserId=ADMIN001`, {
                    method: 'POST'
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
                        body: JSON.stringify({ prgId, cciId })
                    })
                );

                await Promise.all(competencyPromises);
            }

            // 4. 첨부파일 업로드 (구현 필요)
            if (attachments.length > 0) {
                const formDataObj = new FormData();
                formDataObj.append('prgId', prgId);
                attachments.forEach(file => {
                    formDataObj.append('files', file);
                });

                // await fetch('/api/noncur/attachments', { method: 'POST', body: formDataObj });
            }

            alert('프로그램이 성공적으로 등록되었습니다.');
            
            // 폼 초기화
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

        } catch (error) {
            console.error('등록 실패:', error);
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

                        {/* 첨부파일 */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>📎 첨부파일</h4>
                            
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className={styles.input}
                            />
                            {attachments.length > 0 && (
                                <div className={styles.fileList}>
                                    선택된 파일: {attachments.map(f => f.name).join(', ')}
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