// CCAResultPage.jsx
import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularList.css';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';

const CCAResultPage = () => {
    const data = [
        { subject: '의사소통', score: 85 },
        { subject: '문제해결', score: 78 },
        { subject: '자기관리', score: 92 },
        { subject: '대인관계', score: 80 },
        { subject: '글로벌역량', score: 74 },
        { subject: '직업윤리 및 책임역량', score: 88 }
    ];

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="noncur-list-page">

                    <h4>내 핵심역량 결과</h4>

                    <div className="result-meta">
                        <p>최근 응시일자: 2025.06.12</p>
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

                        <div className='core-competency-result'>
                        <h5>종합 결과</h5>
                        <p>부족한 부분 : 글로벌역량, 문제해결</p>
                        <p>강점 부분 : 자기관리, 직업윤리 및 책임역량</p>

                        <h5>개선이 필요한 부분</h5>
                        <p>비교과 추천 : 문제해결 워크숍, 글로벌 역량 강화 프로그램</p>
                    </div>
                    </div>

                    

                </div>
            </div>
            <Footer />
        </>
    );
};

export default CCAResultPage;
