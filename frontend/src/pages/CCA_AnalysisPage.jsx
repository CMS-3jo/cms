//핵심역량등록페이지
import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularList.css';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';
const CCAAnalysisPage = () => {
   const students = [
        { id: 'stu1', name: '홍길동' },
        { id: 'stu2', name: '김영희' },
        { id: 'stu3', name: '이철수' }
    ];

    const historyData = [
        { date: '2025-06-01', studentId: 'stu1', result: { 의사소통: 85, 문제해결: 78, 자기관리: 92, 대인관계: 80, 글로벌역량: 74, 직업윤리: 88 } },
        { date: '2025-06-02', studentId: 'stu2', result: { 의사소통: 75, 문제해결: 82, 자기관리: 88, 대인관계: 85, 글로벌역량: 80, 직업윤리: 90 } },
        { date: '2025-06-03', studentId: 'stu3', result: { 의사소통: 90, 문제해결: 85, 자기관리: 95, 대인관계: 82, 글로벌역량: 78, 직업윤리: 92 } }
    ];

    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedResult, setSelectedResult] = useState(null);

    const handleSelectStudent = (studentId) => {
        setSelectedStudent(studentId);
        const latestHistory = historyData.filter(h => h.studentId === studentId).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        setSelectedResult(latestHistory ? latestHistory.result : null);
    };

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="noncur-list-page">

                    <h4>핵심역량 이력 및 분석 (상담사용)</h4>

                    {/* 학생 선택 */}
                    <div className="form-group">
                        <label htmlFor="student_select">학생 선택</label>
                        <select
                            id="student_select"
                            className="noncur-select"
                            value={selectedStudent}
                            onChange={(e) => handleSelectStudent(e.target.value)}
                        >
                            <option value="">선택하세요</option>
                            {students.map((stu) => (
                                <option key={stu.id} value={stu.id}>{stu.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 설문 이력 */}
                    <div className="core-competency-history">
                        <h5>최근 설문 이력</h5>
                        <ul>
                            {historyData
                                .filter(h => selectedStudent ? h.studentId === selectedStudent : true)
                                .map((h, idx) => (
                                    <li key={idx}>
                                        [{h.date}] 학생ID: {h.studentId}
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* 분석 차트 */}
                    {selectedResult && (
                        <>
                            <h5>핵심역량 분석 결과</h5>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <RadarChart
                                    cx="50%" cy="50%" outerRadius="80%" width={500} height={400}
                                    data={Object.keys(selectedResult).map(key => ({
                                        subject: key,
                                        score: selectedResult[key]
                                    }))}
                                >
                                    <PolarGrid stroke="#ccc" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: '#333', fontSize: 14, fontWeight: 'bold' }}
                                    />
                                    <PolarRadiusAxis
                                        angle={30}
                                        domain={[0, 100]}
                                        tick={{ fill: '#666', fontSize: 12 }}
                                        tickCount={6}
                                        axisLine={false}
                                    />
                                    <Radar
                                        name="핵심역량 점수"
                                        dataKey="score"
                                        stroke="#5c67f2"
                                        strokeWidth={3}
                                        fill="#5c67f2"
                                        fillOpacity={0.5}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: '#333'
                                        }}
                                    />
                                </RadarChart>
                            </div>
                        </>
                    )}

                </div>
            </div>
            <Footer />
        </>
    );
}
export default CCAAnalysisPage;