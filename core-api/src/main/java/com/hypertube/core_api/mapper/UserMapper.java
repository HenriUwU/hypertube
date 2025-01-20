package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.UserDTO;
import com.hypertube.core_api.model.UserEntity;
import org.mapstruct.Mapper;

@Mapper
public interface UserMapper {

    UserDTO map(UserEntity entity);
    UserEntity map(UserDTO dto);

}
