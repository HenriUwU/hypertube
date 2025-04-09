package com.hypertube.core_api.mapper;

import com.hypertube.core_api.model.UserEntity;
import com.hypertube.core_api.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    private final UserRepository userRepository;

    public UserMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Integer UserEntityToInteger(UserEntity userEntity) {
        return userEntity.getId();
    }

    public UserEntity IntegerToUserEntity(Integer userId) {
        return this.userRepository.findById(userId).orElse(null);
    }

}
