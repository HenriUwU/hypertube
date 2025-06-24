package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.UserDTO;
import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.repository.UserRepository;
import org.apache.tika.Tika;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import javax.sql.rowset.serial.SerialBlob;
import java.sql.Blob;
import java.util.Base64;
import java.util.List;


@Mapper(componentModel = "spring")
public abstract class UserMapper {

    @Autowired
    private UserRepository userRepository;

    @Mapping(source = "profilePicture", target = "profilePicture", qualifiedByName = "blobToBase64")
    public abstract UserDTO map(UserEntity entity);

    public abstract List<UserDTO> map(List<UserEntity> entities);

    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "fortyTwoEid", ignore = true)
    @Mapping(target = "discordEid", ignore = true)
    @Mapping(source = "profilePicture", target = "profilePicture", qualifiedByName = "base64ToBlob")
    public abstract UserEntity map(UserDTO dto);

    public UserEntity IntegerToUserEntity(Integer userId) {
        return this.userRepository.findById(userId).orElse(null);
    }
    public Integer UserEntityToInteger(UserEntity userEntity) { return userEntity.getId(); }

    @Named("base64ToBlob")
    public Blob base64ToBlob(String base64) {
        if (base64 != null && base64.contains(",")) {
            String base64Image = base64.split(",")[1];
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            try {
                return new SerialBlob(imageBytes);
            } catch (Exception e) {
                throw new RuntimeException("Failed to convert base64 to Blob", e);
            }
        }
        return null;
    }

    @Named("blobToBase64")
    public String blobToBase64(Blob blob) {
        if (blob != null) {
            try {
                byte[] bytes = blob.getBytes(1, (int) blob.length());
                String base64 = Base64.getEncoder().encodeToString(bytes);
                Tika tika = new Tika();
                String mimeType = tika.detect(bytes);
                return "data:" + mimeType + ";base64," + base64;
            } catch (Exception e) {
                throw new RuntimeException("Failed to convert Blob to base64", e);
            }
        }
        return null;
    }
}
