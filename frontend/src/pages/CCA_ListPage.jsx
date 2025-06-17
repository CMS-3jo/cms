import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularList.css';

const CCAViewPage = () => {
    const [surveyList, setSurveyList] = useState([]);
    const [filter, setFilter] = useState('전체');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch("http://localhost:8082/api/core-cpt/list")
            .then(res => {
                if (!res.ok) throw new Error("네트워크 응답 오류");
                return res.json();
            })
            .then(data => setSurveyList(data))
            .catch(err => {
                console.error("설문 목록 조회 실패:", err);
            });
    }, []);

    const filteredList = surveyList.filter(item => {
        const matchCategory = filter === '전체' || item.categoryCd === filter;
        const matchSearch = item.cciNm.includes(searchTerm) || item.cciDesc?.includes(searchTerm);
        return matchCategory && matchSearch;
    });

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="noncur-list-page">
                    <h4>핵심역량</h4>

                    <div className='searchWrap'>
                        <select
                            id="program_filter"
                            className="noncur-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="전체">전체</option>
                            <option value="의사소통">의사소통</option>
                            <option value="문제해결">문제해결</option>
                            <option value="자기관리">자기관리</option>
                            <option value="대인관계">대인관계</option>
                            <option value="글로벌역량">글로벌역량</option>
                            <option value="직업윤리">직업윤리</option>
                        </select>

                        <input
                            type="text"
                            className="noncur-search-input"
                            placeholder="검색어를 입력하세요."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <ul className='cca-list'>
                        {filteredList.length === 0 ? (
                            <p>일치하는 핵심역량이 없습니다.</p>
                        ) : (
                            filteredList.map((item) => (
                                <li key={item.cciId} className='cca-list-item'>
                                    <div className='cca-list-item-title'>{item.cciNm}</div>
                                    <div className='cca-list-item-content'>{item.cciDesc}</div>
                                    <button
                                        type='button'
                                        className='cca-list-item-button'
                                        onClick={() => {
                                            // 설문 페이지로 이동 (예: /cca/survey/CCI_ID)
                                            window.location.href = `/cca/survey/${item.cciId}`;
                                        }}
                                    >
                                        설문하기
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CCAViewPage;
