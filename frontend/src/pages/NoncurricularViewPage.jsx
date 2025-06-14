//비교과 뷰 페이지
import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularView.css';
const NoncurricularViewPage = () => {
    return (
        <>
            <Header />
            <div className="container_layout">

                <Sidebar />
                <div className="noncur-list-page">

                    <div className='titleWrap'>
                        <h4>프로그램 명</h4>
                        <div className='btnWrap'>
                            <button type='button' className='applyBtn'>신청하기</button>
                            <button type='button' className='shareBtn'><span className="material-symbols-outlined">share</span></button>
                        </div>

                    </div>
                    <div className='preview'>
                        <img alt="프로그램 이미지" class="noncur-image" src="data:image/jpeg;base64,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"></img>
                        <div className='flxc'>

                            <div className='categoryWrap'>
                                <span className='category'>카테고리 1</span>
                            </div>
                            <div className='contactWrap'>
                                <span className='contact'><span className="material-symbols-outlined">pin_drop</span>AAA대학교  AA홀</span>
                                <span className='contact'><span className="material-symbols-outlined">mail</span> hong@aa.com</span>
                                <span className='contact'><span className="material-symbols-outlined">phone</span> 010-1234-5678</span>
                            </div>
                            <div className='targetWrap'>
                                <span className='t1'>대상 : AA대학교 재학생</span>
                                <span className='t3'>학과 : 소프트웨어공학과</span>
                                <span className='t2'>학년 : 모두</span>
                            </div>
                        </div>
                    </div>
                    <div className='infoWrap'>

                        <div className='capacityWrap'><span className="material-symbols-outlined">person</span> 신청 10명 / 정원 100명</div>
                        <div className='dateWrap'><span className="material-symbols-outlined">event</span> D-10</div>
                    </div>
                    <div className='infoWrap2'>
                        <div>교육(활동)기간	2025.06.30. 09:00 ~ 2025.07.03. 12:00</div>
                    </div>

                    <div className='contentWrap'>
                        <h4>프로그램 소개</h4>
                        <p>
                            이 프로그램은 AA대학교 재학생을 위한 특별한 경험을 제공합니다. 다양한 활동과 워크숍을 통해 학생들은 자신의 역량을 개발하고, 새로운 친구들을 만나며, 학업 외에도 많은 것을 배울 수 있습니다.
                        </p>
                        <h4>프로그램 일정</h4>

                        <ul>
                            <li>오리엔테이션 및 아이스브레이킹</li>
                            <li>팀 빌딩 활동</li>
                            <li>전문 강사 초청 워크숍</li>
                            <li>자유 시간 및 네트워킹</li>
                            <li>이건 사실 ul li로 안하고 편하신대로 수정하셔도 좋을것 같아요</li>
                        </ul>
                    </div>
                    <div className='fileWrap'>
                        <h4>첨부파일</h4>
                        <ul>
                            <li><a href="#">프로그램 안내서.pdf</a></li>
                            <li><a href="#">참가 신청서.hwp</a></li>
                        </ul>
                    </div>


                </div>
            </div>
            <Footer />
        </>
    );
}
export default NoncurricularViewPage;