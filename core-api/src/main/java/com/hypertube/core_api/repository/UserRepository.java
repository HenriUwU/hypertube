package com.hypertube.core_api.repository;

import com.hypertube.core_api.entity.UserEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<UserEntity, Integer> {

    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByFortyTwoEid(String eid);
    Optional<UserEntity> findByDiscordEid(String eidDiscord);
    Optional<UserEntity> findByGoogleEid(String googleEid);
    Optional<UserEntity> findByEmail(String email);
}
