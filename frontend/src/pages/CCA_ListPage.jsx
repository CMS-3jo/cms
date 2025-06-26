// src/pages/CCAViewPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularList.css';
import PublicHeader from '../components/layout/PublicHeader';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
const CCAViewPage = () => {
  const [surveyList, setSurveyList] = useState([]);
  const [departments, setDepartments] = useState([]);    // 학과 목록
  const [filter, setFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 설문 목록 가져오기
    fetch('http://localhost:8082/api/core-cpt/list')
      .then(res => {
        if (!res.ok) throw new Error('설문 목록 조회 실패');
        return res.json();
      })
      .then(data => setSurveyList(data))
      .catch(err => console.error(err));

    // 학과(카테고리) 목록 가져오기
    fetch('http://localhost:8082/api/dept/students')
      .then(res => {
        if (!res.ok) throw new Error('학과 목록 조회 실패');
        return res.json();
      })
      .then(data => setDepartments(data))
      .catch(err => console.error(err));
  }, []);

  // 셀렉트 옵션: 현재 사용자의 학과 + '전체'
  const { user } = useAuth();
  const profile = useUserProfile();

  const categories = useMemo(() => {
    return ['전체', profile?.deptCode].filter(Boolean);
  }, [profile]);

  const filteredList = surveyList.filter(item => {
    const matchCategory = filter === '전체' || item.categoryCd === filter;
    const matchSearch =
      item.cciNm.includes(searchTerm) ||
      (item.cciDesc && item.cciDesc.includes(searchTerm));
    return matchCategory && matchSearch;
  });

  return (
    <>
       <PublicHeader />
      <div className="container_layout">
        <Sidebar />
        <div className="noncur-list-page">
          <h4>핵심역량</h4>

          <div className="searchWrap">
            <select
              id="program_filter"
              className="noncur-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              {categories.map(cat => {
                if (cat === '전체') {
                    return (
                    <option key="전체" value="전체">
                      전체
                    </option>
                  );
                }

                if (user?.role === 'ROLE_STUDENT') {
                  return (
                    <option key={cat} value={cat}>
                      동일 학과
                    </option>
                  );
                }

                const dept = departments.find(d => d.deptCd === cat);
                return (
                  <option key={cat} value={cat}>
                    {dept?.deptNm || cat}
                  </option>
                );
              })}
            </select>

            <input
              type="text"
              className="noncur-search-input"
              placeholder="검색어를 입력하세요."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <ul className="cca-list">
            {filteredList.length === 0 ? (
              <p>일치하는 핵심역량이 없습니다.</p>
            ) : (
              filteredList.map(item => (
                <li key={item.cciId} className="cca-list-item">
                  <div className="cca-list-item-title">{item.cciNm}</div>
                  <div className="cca-list-item-content">{item.cciDesc}</div>
                  <Link
                    to={`/cca/survey/${item.cciId}`}
                    className="cca-list-item-button"
                  >
                    설문하기
                  </Link>
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
