package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.model.CommentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "id", source = "id")
    CommentDTO map(CommentEntity entity);
    CommentEntity map(CommentDTO dto);
    List<CommentDTO> map(List<CommentEntity> entities);

}
