package kr.co.cms.domain.cca.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.cca.entity.CoreCptEval;

@Repository
public interface CoreCptEvalRepository extends JpaRepository<CoreCptEval, String> {

    /**
     * stdNo와 question.coreCptInfo.cciId로 답안 조회
     */
    List<CoreCptEval> findByStdNoAndQuestion_CoreCptInfo_CciId(String stdNo, String cciId);
    /**
     * 학과 평균 점수 조회
     */
    @org.springframework.data.jpa.repository.Query(value = """
            SELECT q.CATEGORY_CD AS category, AVG(e.ANS_SCORE) * 20 AS score
            FROM CORE_CPT_EVAL e
            JOIN CORE_CPT_QST q ON e.QST_ID = q.QST_ID
            JOIN STD_INFO s ON e.STD_NO = s.STD_NO
            WHERE q.CCI_ID = :cciId AND s.DEPT_CD = :deptCd
            GROUP BY q.CATEGORY_CD
            """, nativeQuery = true)
    List<Object[]> findDeptAverageScores(@org.springframework.data.repository.query.Param("cciId") String cciId,
            @org.springframework.data.repository.query.Param("deptCd") String deptCd);

    /**
     * 전체 평균 점수 조회
     */
    @org.springframework.data.jpa.repository.Query(value = """
            SELECT q.CATEGORY_CD AS category, AVG(e.ANS_SCORE) * 20 AS score
            FROM CORE_CPT_EVAL e
            JOIN CORE_CPT_QST q ON e.QST_ID = q.QST_ID
            WHERE q.CCI_ID = :cciId
            GROUP BY q.CATEGORY_CD
            """, nativeQuery = true)
    List<Object[]> findOverallAverageScores(@org.springframework.data.repository.query.Param("cciId") String cciId);

    /**
     * 학생의 가장 최근 응시 일자 조회
     */
    @org.springframework.data.jpa.repository.Query("""
            SELECT MAX(e.ansDt)
            FROM CoreCptEval e
            WHERE e.stdNo = :stdNo
              AND e.question.coreCptInfo.cciId = :cciId
            """)
    LocalDateTime findLatestAnswerDate(@org.springframework.data.repository.query.Param("stdNo") String stdNo,
                                       @org.springframework.data.repository.query.Param("cciId") String cciId);

    /**
     * 핵심역량 응시 학생 목록과 최근 응시일 조회
     */
    @org.springframework.data.jpa.repository.Query("""
            SELECT s.stdNo, s.stdNm, s.deptCd, MAX(e.ansDt)
            FROM CoreCptEval e JOIN StdInfo s ON e.stdNo = s.stdNo
            WHERE e.question.coreCptInfo.cciId = :cciId
            GROUP BY s.stdNo, s.stdNm, s.deptCd
            """)
    List<Object[]> findStudentsLatest(@org.springframework.data.repository.query.Param("cciId") String cciId);

    /**
     * 특정 학생의 최근 응시 답안 조회
     */
    @org.springframework.data.jpa.repository.Query("""
            SELECT e
            FROM CoreCptEval e JOIN FETCH e.question q
            WHERE e.stdNo = :stdNo
              AND q.coreCptInfo.cciId = :cciId
              AND e.ansDt = (
                  SELECT MAX(e2.ansDt) FROM CoreCptEval e2
                  WHERE e2.stdNo = :stdNo AND e2.question.coreCptInfo.cciId = :cciId
              )
            """)
    List<CoreCptEval> findLatestEvals(@org.springframework.data.repository.query.Param("stdNo") String stdNo,
                                      @org.springframework.data.repository.query.Param("cciId") String cciId);
}