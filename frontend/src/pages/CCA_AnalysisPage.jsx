import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularList.css';
import { useAuth } from '../hooks/useAuth';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';
const CCAAnalysisPage = () => {
    const { user, apiCall } = useAuth();
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedResult, setSelectedResult] = useState(null);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const listRes = await apiCall('http://localhost:8082/api/core-cpt/list');
                const list = await listRes.json();
                if (!Array.isArray(list) || list.length === 0) return;
                const cciId = list[0].cciId;
                const res = await apiCall(`http://localhost:8082/api/core-cpt/${cciId}/students`);
                if (!res.ok) return;
                const arr = await res.json();
                setResults(arr);
                setStudents(arr.map(s => ({ id: s.stdNo, name: s.stdNm })));
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [user, apiCall]);

    const handleSelectStudent = (studentId) => {
        setSelectedStudent(studentId);
        const item = results.find(r => r.stdNo === studentId);
        if (item) {
            const map = {};
            item.scores.forEach(s => { map[s.competency] = s.score; });
            setSelectedResult({ date: item.latestDate, result: map });
        } else {
            setSelectedResult(null);
        }
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
                            {results
                                .filter(r => selectedStudent ? r.stdNo === selectedStudent : true)
                                .map((r, idx) => (
                                    <li key={idx}>
                                        [{new Date(r.latestDate).toLocaleDateString()}] 학생ID: {r.stdNo}
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* 분석 차트 */}
                    {selectedResult && (
                        <>
                            <h5>핵심역량 분석 결과</h5>
                            <p>최근 응시일자: {new Date(selectedResult.date).toLocaleDateString()}</p>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <RadarChart
                                    cx="50%" cy="50%" outerRadius="80%" width={500} height={400}
                                    data={Object.keys(selectedResult.result).map(key => ({
                                        subject: key,
                                        score: selectedResult.result[key]
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