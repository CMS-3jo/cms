package kr.co.cms.domain.cca.repository;

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
    List<Object[]> findDeptAverageScores(String cciId, String deptCd);

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
    List<Object[]> findOverallAverageScores(String cciId);

}