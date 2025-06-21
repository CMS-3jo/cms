package kr.co.cms.global.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.co.cms.global.util.IdGenerator;

public interface IdManagedRepository {


    String findLatestIdByPrefix(String prefix);
}
