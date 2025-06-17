package kr.co.cms.domain.cnsl.repository;

import jakarta.persistence.*;
import kr.co.cms.domain.cnsl.dto.CounselingListResponse;
import kr.co.cms.domain.cnsl.dto.CounselingSearchCondition;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
@RequiredArgsConstructor
public class CounselingCustomRepositoryImpl implements CounselingCustomRepository {

    private final EntityManager em;

    @Override
    public Page<CounselingListResponse> findCounselingList(CounselingSearchCondition condition, Pageable pageable) {
    	// 데이터 조회용 쿼리
        StringBuilder queryBuilder = new StringBuilder("""
            SELECT 
                a.STAT_CD AS status,
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

        // 필터 조건 공통 처리
        if (condition.getStatus() != null && !condition.getStatus().isBlank()) {
            queryBuilder.append(" AND a.STAT_CD = :status");
            countQueryBuilder.append(" AND a.STAT_CD = :status");
            params.put("status", condition.getStatus());
        }

        if (condition.getSearch() != null && !condition.getSearch().isBlank()) {
            queryBuilder.append(" AND s.STD_NM LIKE :search");
            countQueryBuilder.append(" AND s.STD_NM LIKE :search");
            params.put("search", "%" + condition.getSearch() + "%");
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
                .status(convertStatus(t.get("status", String.class)))
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
            case "REQUESTED" -> "상담대기";
            case "COMPLETED" -> "상담완료";
            case "CANCELLED" -> "상담중지";
            default -> statCd;
        };
    }
}
