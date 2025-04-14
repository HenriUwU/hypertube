package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.UserDTO;
import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.repository.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class UserMapper {

    @Autowired
    private UserRepository userRepository;

    public abstract UserDTO map(UserEntity entity);

    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "fortyTwoEid", ignore = true)
    @Mapping(target = "discordEid", ignore = true)
    public abstract UserEntity map(UserDTO dto);

    public Integer UserEntityToInteger(UserEntity userEntity) {
        return userEntity.getId();
    }

    public UserEntity IntegerToUserEntity(Integer userId) {
        return this.userRepository.findById(userId).orElse(null);
    }

}
