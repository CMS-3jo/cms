//비교과 등록
import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularRegister.css';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Korean } from "flatpickr/dist/l10n/ko.js";

const NoncurricularRegisterPage = () => {

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="noncur-register-page">
                    <h3>비교과 프로그램 등록</h3>
                    <form>
                        <div className="form-group">
                            <label>프로그램 명</label>
                            <input type="text" name="title" />
                        </div>
                        <div className="form-group">
                            <label>카테고리</label>
                            <input type="text" name="category" />
                        </div>
                        <div className="form-group">
                            <label>장소</label>
                            <input type="text" name="location" />
                        </div>
                        <div className="form-group">
                            <label>문의 이메일</label>
                            <input type="email" name="email" />
                        </div>
                        <div className="form-group">
                            <label>문의 전화</label>
                            <input type="tel" name="phone" />
                        </div>
                        <div className="form-group">
                            <label>대상 학과</label>
                            <input type="text" name="department" />
                        </div>
                        <div className="form-group">
                            <label>대상 학년</label>
                            <input type="text" name="grade" />
                        </div>
                        <div className="form-group">
                            <label>정원</label>
                            <input type="number" name="capacity" />
                        </div>
                        <div className="form-group">
                            <label>교육 시작일</label>
                            <Flatpickr
                                options={{
                                    locale: Korean,
                                    enableTime: true,
                                    dateFormat: 'Y-m-d H:i',
                                }}
                                 placeholder="날짜를 선택해주세요"
                            />
                        </div>
                        <div className="form-group">
                            <label>교육 종료일</label>
                            <Flatpickr
                                options={{
                                    locale: Korean,
                                    enableTime: true,
                                    dateFormat: 'Y-m-d H:i',
                                }}
                                 placeholder="날짜를 선택해주세요"
                            />
                        </div>
                        <div className="form-group">
                            <label>프로그램 소개</label>
                            <textarea name="description"></textarea>
                        </div>
                        <div className="form-group">
                            <label>세부 일정</label>
                            <textarea name="schedule"></textarea>
                        </div>
                        <div className="form-group">
                            <label>첨부파일</label>
                            <input type="file" multiple />
                        </div>
                        <button type="button" className="submitBtn">등록</button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}
export default NoncurricularRegisterPage;