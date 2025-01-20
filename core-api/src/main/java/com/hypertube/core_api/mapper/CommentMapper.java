package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.model.CommentEntity;
import org.mapstruct.Mapper;

@Mapper
public interface CommentMapper {

    CommentDTO map(CommentEntity entity);
    CommentEntity map(CommentDTO dto);

}
