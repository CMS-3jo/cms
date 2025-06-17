import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import Footer from '../components/layout/Footer'

import '../../public/css/CCARegPage.css'
import '../../public/css/NoncurricularList.css'

const COMPETENCIES = [
  '의사소통',
  '문제해결',
  '자기관리',
  '대인관계',
  '글로벌역량',
  '직업윤리 및 책임역량'
]

const CCARegPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // 학과 옵션 로드
  const [departments, setDepartments] = useState([])
  useEffect(() => {
    fetch('/api/dept/students')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(console.error)
  }, [])

  // 설문 리스트 로드
  const [surveys, setSurveys] = useState([])
  useEffect(() => {
    fetch('/api/core-cpt/list')
      .then(res => {
        if (!res.ok) throw new Error(res.status)
        return res.json()
      })
      .then(data => setSurveys(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err)
        setSurveys([])
      })
  }, [])

  // Step1 입력 상태
  const [surveyTitle, setSurveyTitle] = useState('')
  const [department, setDepartment] = useState('')

  // Step2 질문 상태
  const [questionsByComp, setQuestionsByComp] = useState(
    COMPETENCIES.reduce((acc, comp) => {
      acc[comp] = [{ id: 1, content: '' }]
      return acc
    }, {})
  )

  const handleAddQuestion = comp => {
    setQuestionsByComp(prev => {
      const list = prev[comp]
      const newId = list.length + 1
      return { ...prev, [comp]: [...list, { id: newId, content: '' }] }
    })
  }

  const handleQuestionChange = (comp, id, value) => {
    setQuestionsByComp(prev => ({
      ...prev,
      [comp]: prev[comp].map(q =>
        q.id === id ? { ...q, content: value } : q
      )
    }))
  }

  const handleDeleteQuestion = (comp, id) => {
    setQuestionsByComp(prev => ({
      ...prev,
      [comp]: prev[comp].filter(q => q.id !== id)
    }))
  }

  const handleNext = () => {
    if (!surveyTitle.trim() || !department) {
      alert('제목과 학과를 모두 입력해주세요.')
      return
    }
    setStep(2)
  }

  const handlePrev = () => setStep(1)

  const handleSubmit = async () => {
    // 빈 문항 체크
    for (let comp of COMPETENCIES) {
      if (questionsByComp[comp].some(q => !q.content.trim())) {
        alert(`${comp} 문항을 모두 입력해주세요.`)
        return
      }
    }

    const payload = {
      title: surveyTitle,
      ccaId: department,   // ← DTO가 기대하는 필드명으로 변경
      questions: COMPETENCIES.flatMap(comp =>
        questionsByComp[comp].map((q, idx) => ({
          competency: comp,
          order: idx + 1,
          content: q.content
        }))
      ),
      regUserId: 'admin001'
    }

    try {
      const res = await fetch('/api/core-cpt/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('설문이 성공적으로 등록되었습니다.')
        // 목록 새로고침
        const updated = await fetch('/api/core-cpt/list').then(r => r.json())
        setSurveys(updated)
        // 초기화
        setStep(1)
        setSurveyTitle('')
        setDepartment('')
        setQuestionsByComp(
          COMPETENCIES.reduce((acc, comp) => {
            acc[comp] = [{ id: 1, content: '' }]
            return acc
          }, {})
        )
      } else {
        alert('등록 실패: 서버 오류')
      }
    } catch (e) {
      console.error(e)
      alert('네트워크 오류')
    }
  }

  const handleDeleteSurvey = async cciId => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      const res = await fetch(`/api/core-cpt/${cciId}`, { method: 'DELETE' })
      if (res.ok) {
        setSurveys(surveys.filter(s => s.cciId !== cciId))
      } else {
        alert('삭제 실패')
      }
    } catch (e) {
      console.error(e)
      alert('네트워크 오류')
    }
  }

  const handleEditSurvey = cciId => {
    navigate(`/cca/edit/${cciId}`)
  }

  return (
    <>
      <Header />
      <div className="cca-reg-container">
        <Sidebar />
        <div className="cca-reg-content">
          <h3>핵심역량 설문 관리</h3>

          {/* 설문 목록 */}
          <section className="survey-list">
            <h4>설문 리스트</h4>
            <table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>학과</th>
                  <th>등록일</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(survey => {
                  // 학과코드로 학과명 찾기
                  const dept = departments.find(d => d.deptCd === survey.categoryCd)
                  return (
                    <tr key={survey.cciId}>
                      <td>{survey.cciNm}</td>
                      <td>{dept ? dept.deptNm : ''}</td>
                      <td>
                        {survey.regDt
                          ? new Date(survey.regDt).toLocaleDateString()
                          : ''}
                      </td>
                      <td>
                        <button onClick={() => handleEditSurvey(survey.cciId)}>
                          수정
                        </button>
                        <button onClick={() => handleDeleteSurvey(survey.cciId)}>
                          삭제
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>

          {/* 등록/수정 폼 */}
          <h4>신규 설문 등록</h4>
          {step === 1 && (
            <div className="step step-1">
              <div className="form-group">
                <label>설문 제목</label>
                <input
                  type="text"
                  value={surveyTitle}
                  onChange={e => setSurveyTitle(e.target.value)}
                  placeholder="설문 제목을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>학과 선택</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                >
                  <option value="">-- 학과 선택 --</option>
                  {departments.map(d => (
                    <option key={d.deptCd} value={d.deptCd}>
                      {d.deptNm}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-primary" onClick={handleNext}>
                다음 단계
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step step-2">
              {COMPETENCIES.map(comp => (
                <div key={comp} className="comp-section">
                  <h5>{comp}</h5>
                  {questionsByComp[comp].map(q => (
                    <div key={q.id} className="question-row">
                      <input
                        type="text"
                        value={q.content}
                        onChange={e =>
                          handleQuestionChange(comp, q.id, e.target.value)
                        }
                        placeholder={`${comp} 관련 문항을 입력하세요`}
                      />
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteQuestion(comp, q.id)}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn-add"
                    onClick={() => handleAddQuestion(comp)}
                  >
                    문항 추가
                  </button>
                </div>
              ))}
              <div className="step-nav">
                <button className="btn-secondary" onClick={handlePrev}>
                  이전
                </button>
                <button className="btn-primary" onClick={handleSubmit}>
                  설문 등록하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CCARegPage
