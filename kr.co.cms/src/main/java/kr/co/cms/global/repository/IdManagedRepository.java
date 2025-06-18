package kr.co.cms.global.repository;

public interface IdManagedRepository {

    /**
     * 특정 접두사(prefix)를 가진 가장 마지막 ID를 반환합니다.
     * @param prefix 예: "PRG2025"
     * @return 가장 마지막 ID. 없으면 null.
     */
    String findLatestIdByPrefix(String prefix);
}
