package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.model.CommentEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CommentMapper {

    CommentDTO map(CommentEntity entity);
    CommentEntity map(CommentDTO dto);
    List<CommentDTO> map(List<CommentEntity> entities);

}
