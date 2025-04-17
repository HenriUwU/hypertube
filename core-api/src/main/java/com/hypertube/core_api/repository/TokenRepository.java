package com.hypertube.core_api.repository;

import com.hypertube.core_api.entity.TokenEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository extends CrudRepository<TokenEntity, Integer> {
    TokenEntity findByToken(String token);
}
