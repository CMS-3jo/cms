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
    const [departments, setDepartments] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedResult, setSelectedResult] = useState(null);
    const [selectedDept, setSelectedDept] = useState('');
    useEffect(() => {
        fetch('http://localhost:8082/api/dept/students')
            .then(res => res.ok ? res.json() : [])
            .then(setDepartments)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
             setSelectedStudent('');
            setSelectedResult(null);
            try {
                const listRes = await apiCall('http://localhost:8082/api/core-cpt/list');
                const list = await listRes.json();
                if (!Array.isArray(list) || list.length === 0) return;
                const cciId = list[0].cciId;
                 let url = `http://localhost:8082/api/core-cpt/${cciId}/students`;
                if (selectedDept) url += `?deptCd=${selectedDept}`;
                const res = await apiCall(url);
                if (!res.ok) return;
                const arr = await res.json();
                setResults(arr);
                setStudents(arr.map(s => ({ id: s.stdNo, name: s.stdNm })));
            } catch (e) {
                console.error(e);
            }
        };
        load();
       }, [user, apiCall, selectedDept]);


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
                <div className="cca_analy">

                    <h4>핵심역량 이력 및 분석 (상담사용)</h4>

                       {/* 학과 및 학생 선택 */}
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label htmlFor="dept_select">학과 선택</label>
                        <select
                            id="dept_select"
                            className="noncur-select"
                            value={selectedDept}
                            onChange={e => setSelectedDept(e.target.value)}
                        >
                            <option value="">전체</option>
                            {departments.map(dept => (
                                <option key={dept.deptCd} value={dept.deptCd}>{dept.deptNm}</option>
                            ))}
                        </select>
                    </div>


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
                                 <option key={stu.id} value={stu.id}>{`${stu.name} (${stu.id})`}</option>
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
                                       [{new Date(r.latestDate).toLocaleDateString()}] {r.stdNm} ({r.stdNo})
                                        <ul style={{ marginLeft: '20px' }}>
                                            {r.scores.map(s => (
                                                <li key={s.competency}>{s.competency}: {s.score.toFixed(2)}</li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* 분석 차트 */}
                    {selectedResult && (
                        <>
                           <h5>핵심역량 분석 결과</h5>
                        <p>최근 응시일자: {new Date(selectedResult.date).toLocaleDateString()}</p>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
                            {Object.entries(selectedResult.result).map(([comp, score]) => (
                                <li key={comp}>{comp}: {score.toFixed(2)}</li>
                            ))}
                        </ul>
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