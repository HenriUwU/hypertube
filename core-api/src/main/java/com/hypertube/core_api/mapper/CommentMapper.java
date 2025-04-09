package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.model.CommentEntity;
import com.hypertube.core_api.repository.CommentRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public abstract class CommentMapper {

    @Autowired
    private CommentRepository commentRepository;

    public abstract CommentDTO map(CommentEntity entity);
    @Mapping(target = "likes", defaultValue = "0")
    public abstract CommentEntity map(CommentDTO dto);
    public abstract List<CommentDTO> map(List<CommentEntity> entities);

    public CommentEntity map(Integer id) {
        return commentRepository.findById(id).orElse(null);
    }
}
