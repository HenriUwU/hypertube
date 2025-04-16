package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.UserDTO;
import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.repository.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import javax.sql.rowset.serial.SerialBlob;
import java.sql.Blob;
import java.sql.SQLException;

@Mapper(componentModel = "spring")
public abstract class UserMapper {

    @Autowired
    private UserRepository userRepository;

    @Mapping(source = "profilePicture", target = "profilePicture", qualifiedByName = "blobToBytes")
    public abstract UserDTO map(UserEntity entity);

    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "fortyTwoEid", ignore = true)
    @Mapping(target = "discordEid", ignore = true)
    @Mapping(source = "profilePicture", target = "profilePicture", qualifiedByName = "bytesToBlob")
    public abstract UserEntity map(UserDTO dto);

    public Integer UserEntityToInteger(UserEntity userEntity) {
        return userEntity.getId();
    }

    public UserEntity IntegerToUserEntity(Integer userId) {
        return this.userRepository.findById(userId).orElse(null);
    }

    @Named("blobToBytes")
    public byte[] blobToBytes(Blob blob) {
        try {
            return blob != null ? blob.getBytes(1, (int) blob.length()) : null;
        } catch (SQLException e) {
            throw new RuntimeException("Failed to convert Blob to byte[]", e);
        }
    }

    @Named("bytesToBlob")
    public Blob bytesToBlob(byte[] bytes) {
        try {
            return bytes != null ? new SerialBlob(bytes) : null;
        } catch (SQLException e) {
            throw new RuntimeException("Failed to convert byte[] to Blob", e);
        }
    }
}
