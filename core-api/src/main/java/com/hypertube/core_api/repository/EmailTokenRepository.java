package com.hypertube.core_api.repository;

import com.hypertube.core_api.entity.EmailTokenEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailTokenRepository extends CrudRepository<EmailTokenEntity, Integer> {
    EmailTokenEntity findByToken(String token);
}
