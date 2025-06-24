package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.CommentLikesDTO;
import com.hypertube.core_api.entity.CommentLikesEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class, CommentMapper.class})
public interface CommentLikesMapper {
    CommentLikesEntity map(CommentLikesDTO commentLikesDTO);
    List<CommentLikesDTO> map(List<CommentLikesEntity> commentLikesEntities);
}
