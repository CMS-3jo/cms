// CCAResultPage.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularList.css';
import { useAuth } from '../hooks/useAuth';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';
import PublicHeader from '../components/layout/PublicHeader';

const CCAResultPage = () => {
    const { user, apiCall } = useAuth();
    const [data, setData] = useState([]);
 const [summary, setSummary] = useState({ strengths: [], weaknesses: [], recommendations: [], latestDate: null });

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const listRes = await apiCall('http://localhost:8082/api/core-cpt/list');
                const list = await listRes.json();
                if (!Array.isArray(list) || list.length === 0) return;
                const cciId = list[0].cciId;
                const res = await apiCall(`http://localhost:8082/api/core-cpt/${cciId}/summary?stdNo=${user.identifierNo}`);
                if (!res.ok) return;
                const dto = await res.json();
                const map = {};
                dto.studentScores.forEach(s => {
                    map[s.competency] = { subject: s.competency, me: s.score };
                });
                dto.deptAvgScores.forEach(s => {
                    map[s.competency] = { ...(map[s.competency] || { subject: s.competency }), dept: s.score };
                });
                dto.overallAvgScores.forEach(s => {
                    map[s.competency] = { ...(map[s.competency] || { subject: s.competency }), all: s.score };
                });
                setData(Object.values(map));
                setSummary({ strengths: dto.strengths, weaknesses: dto.weaknesses, recommendations: dto.recommendations, latestDate: dto.latestAnswerDate });
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [user, apiCall]);

    return (
        <>
            <PublicHeader />
            <div className="container_layout">
                <Sidebar />
                <div className="noncur-list-page">

                    <h4>내 핵심역량 결과</h4>

                    <div className="result-meta">
                         <p>최근 응시일자: {summary.latestDate ? new Date(summary.latestDate).toLocaleDateString() : '-'}</p>
                    </div>

                    {/* 육각형 그래프 */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', height: '400px' }}>
                        <RadarChart
                            cx="50%" cy="50%" outerRadius="80%" width={500} height={400}
                            data={data}
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
                                name="내 점수"
                                dataKey="me"
                                stroke="#5c67f2"
                                strokeWidth={3}
                                fill="#5c67f2"
                                fillOpacity={0.4}
                            />
                            <Radar
                                name="학과 평균"
                                dataKey="dept"
                                stroke="#82ca9d"
                                strokeWidth={2}
                                fill="#82ca9d"
                                fillOpacity={0.3}
                            />
                            <Radar
                                name="전체 평균"
                                dataKey="all"
                                stroke="#ffc658"
                                strokeWidth={2}
                                fill="#ffc658"
                                fillOpacity={0.3}
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

                        <div className='core-competency-result'>
                            <h5>종합 결과</h5>
                            <p>부족한 부분 : {summary.weaknesses.join(', ') || '-'}</p>
                            <p>강점 부분 : {summary.strengths.join(', ') || '-'}</p>

                            <h5>개선이 필요한 부분</h5>
                            <p>비교과 추천 : {summary.recommendations.join(', ') || '-'}</p>
                        </div>
                    </div>



                </div>
            </div>
            <Footer />
        </>
    );
};

export default CCAResultPage;
