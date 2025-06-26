package kr.co.cms.domain.cnsl.repository;

import jakarta.persistence.*;
import kr.co.cms.domain.cnsl.dto.CounselingDetailDto;
import kr.co.cms.domain.cnsl.dto.CounselingListResponse;
import kr.co.cms.domain.cnsl.dto.CounselingSearchCondition;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;

import java.sql.Timestamp;
import java.util.*;

@RequiredArgsConstructor
public class CounselingCustomRepositoryImpl implements CounselingCustomRepository {

    private final EntityManager em;

    @Override
    public Page<CounselingListResponse> findCounselingList(CounselingSearchCondition condition, Pageable pageable) {
    	String status = condition.getStatus();
    	String emplNo = condition.getCounselorId();
    	// 데이터 조회용 쿼리
        StringBuilder queryBuilder = new StringBuilder("""
            SELECT 
        		a.CNSL_APLY_ID AS cnslAplyId,
                a.STAT_CD AS status,
                a.EMPL_NO AS emplNo,
                s.STD_NM AS name,
                s.STD_NO AS studentId,
                s.EMAIL AS email,
                s.PHONE_NUMBER AS phone
            FROM CNSL_APLY a
            JOIN STD_INFO s ON a.STD_NO = s.STD_NO
            WHERE 1=1
        """);

        // 카운트용 쿼리 (결과 개수만 세는 쿼리)
        StringBuilder countQueryBuilder = new StringBuilder("""
            SELECT COUNT(*)
            FROM CNSL_APLY a
            JOIN STD_INFO s ON a.STD_NO = s.STD_NO
            WHERE 1=1
        """);

        Map<String, Object> params = new HashMap<>();
        
        if (condition.getSearch() != null && !condition.getSearch().isBlank()) {
            queryBuilder.append("""
                AND (
                    s.STD_NM LIKE :search
                    OR s.STD_NO LIKE :search
                    OR s.EMAIL LIKE :search
                )
            """);
            countQueryBuilder.append("""
                AND (
                    s.STD_NM LIKE :search
                    OR s.STD_NO LIKE :search
                    OR s.EMAIL LIKE :search
                )
            """);
            params.put("search", "%" + condition.getSearch() + "%");
        }

        // 1. 배정전 → EMPL_NO IS NULL
        if ("배정전".equals(status)) {
            queryBuilder.append(" AND a.EMPL_NO IS NULL");
            countQueryBuilder.append(" AND a.EMPL_NO IS NULL");
        }
        // 2. 내 상담 → EMPL_NO = :emplNo
        else if ("내 상담".equals(status)) {
            if (emplNo != null) {
                queryBuilder.append(" AND a.EMPL_NO = :emplNo");
                countQueryBuilder.append(" AND a.EMPL_NO = :emplNo");
                params.put("emplNo", emplNo);
            } else {
                // 사번이 null이면 일부러 빈 결과 반환 유도
                queryBuilder.append(" AND 1=0");
                countQueryBuilder.append(" AND 1=0");
            }
        }
        // 3. 일반 상태코드 ("15", "17" 등)
        else if (status != null && !status.isBlank()) {
            queryBuilder.append(" AND a.STAT_CD = :status");
            countQueryBuilder.append(" AND a.STAT_CD = :status");
            params.put("status", status);
        }

        // 정렬은 조회 쿼리에서만
        queryBuilder.append(" ORDER BY a.APLY_DTTM DESC");

        // 쿼리 객체 생성
        Query query = em.createNativeQuery(queryBuilder.toString(), Tuple.class);
        Query countQuery = em.createNativeQuery(countQueryBuilder.toString());

        // 파라미터 바인딩
        params.forEach((k, v) -> {
            query.setParameter(k, v);
            countQuery.setParameter(k, v);
        });

        // 페이징 적용
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        // 결과 매핑
        List<Tuple> results = query.getResultList();
        List<CounselingListResponse> content = results.stream().map(t ->
            CounselingListResponse.builder()
                .cnslAplyId(t.get("cnslAplyId", String.class))
                .status(convertStatus(t.get("status", String.class)))
                .emplNo(t.get("emplNo", String.class))
                .name(t.get("name", String.class))
                .studentId(t.get("studentId", String.class))
                .email(t.get("email", String.class))
                .phone(t.get("phone", String.class))
                .build()
        ).toList();

        // 전체 개수 조회
        long total = ((Number) countQuery.getSingleResult()).longValue();

        // Page로 포장해서 반환
        return new PageImpl<>(content, pageable, total);
    }

    private String convertStatus(String statCd) {
        return switch (statCd) {
            case "15" -> "상담대기";
            case "18" -> "상담완료";
            case "17" -> "상담중";
            default -> statCd;
        };
    }
    
    @Override
    public CounselingDetailDto findCounselingDetailById(String id) {
        String sql = """
			SELECT 
			  a.CNSL_APLY_ID AS cnslAplyId,
			  a.STD_NO AS stdNo,
			  s.STD_NM AS stdNm,
			  a.EMPL_NO AS EmplNo,
			  e.EMPL_NM AS emplNm,
			  a.TYPE_CD AS typeCd,
			  a.STAT_CD AS statCd,
			  a.REQ_DTTM AS reqDttm,
			  a.APPLY_CONTENT AS applyContent,
			  s.DEPT_CD AS deptCd,
			  d.DEPT_NM AS deptNm,
			  s.PHONE_NUMBER AS phone,
			  s.EMAIL AS email
			FROM CNSL_APLY a
			JOIN STD_INFO s ON a.STD_NO = s.STD_NO
			LEFT JOIN DEPT_INFO d ON s.DEPT_CD = d.DEPT_CD
			LEFT JOIN EMPL_INFO e ON a.EMPL_NO = e.EMPL_NO
			WHERE a.CNSL_APLY_ID = :id
        """;

        Query query = em.createNativeQuery(sql, Tuple.class);
        query.setParameter("id", id);

        Tuple t = (Tuple) query.getSingleResult();

        return CounselingDetailDto.builder()
            .cnslAplyId(t.get("cnslAplyId", String.class))
            .stdNo(t.get("stdNo", String.class))
            .stdNm(t.get("stdNm", String.class))
            .emplNo(t.get("emplNo", String.class))
            .emplNm(t.get("emplNm", String.class))
            .typeCd(convertType(t.get("typeCd", String.class)))
            .statCd(convertStatus(t.get("statCd", String.class)))
            .reqDttm(Optional.ofNullable(t.get("reqDttm", Timestamp.class))
                    .map(Timestamp::toLocalDateTime)
                    .orElse(null))
            .applyContent(t.get("applyContent", String.class))
            .deptCd(t.get("deptCd", String.class))
            .deptNm(t.get("deptNm", String.class))
            .phone(t.get("phone", String.class))
            .email(t.get("email", String.class))
            .build();
    }
    
    private String convertType(String typeCd) {
        return switch (typeCd) {
            case "08" -> "취업상담";
            case "09" -> "진로상담";
            case "10" -> "고충상담";
            case "11" -> "심리상담";
            case "12" -> "익명상담";
            case "13" -> "위기상담";
            case "14" -> "학업상담";
            default -> typeCd;
        };
    }
    
    
}
