//핵심역량뷰페이지
import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularList.css';
const CCAViewPage = () => {
    return (
        <>
            <Header />
            <div className="container_layout">

                <Sidebar />
                <div className="noncur-list-page">

                    <h4>핵심역량</h4>
                    <div className='searchWrap'>

                        <select id="program_filter" className="noncur-select">
                            <option value="전체">전체</option>
                            <option value="의사소통">의사소통</option>
                            <option value="문제해결">문제해결</option>
                            <option value="자기관리">자기관리</option>
                            <option value="대인관계">대인관계</option>
                            <option value="글로벌역량">글로벌역량</option>
                            <option value="직업윤리">직업윤리</option>
                        </select>
                        <input type="text" className="noncur-search-input" placeholder="검색어를 입력하세요." />
                    </div>
                    <ul className='cca-list '>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>의사소통</div>
                            <div className='cca-list-item-content'>의사소통에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>자기관리</div>
                            <div className='cca-list-item-content'>자기관리에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>대인관계</div>
                            <div className='cca-list-item-content'>대인관계에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>대인관계</div>
                            <div className='cca-list-item-content'>대인관계에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>대인관계</div>
                            <div className='cca-list-item-content'>대인관계에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>글로벌역량</div>
                            <div className='cca-list-item-content'>글로벌역량에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>글로벌역량</div>
                            <div className='cca-list-item-content'>글로벌역량에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>직업윤리</div>
                            <div className='cca-list-item-content'>직업윤리에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>직업윤리</div>
                            <div className='cca-list-item-content'>직업윤리에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>직업윤리</div>
                            <div className='cca-list-item-content'>직업윤리에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                        <li className='cca-list-item'>
                            <div className='cca-list-item-title'>직업윤리</div>
                            <div className='cca-list-item-content'>직업윤리에 대한 설명.</div>
                            <button type='button' className='cca-list-item-button'>설문하기</button>
                        </li>
                    </ul>
                </div>
            </div>
            <Footer />
        </>
    );
}
export default CCAViewPage;