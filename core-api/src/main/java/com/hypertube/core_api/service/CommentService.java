package com.hypertube.core_api.service;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.mapper.CommentMapper;
import com.hypertube.core_api.model.CommentEntity;
import com.hypertube.core_api.repository.CommentRepository;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;

    public CommentService(CommentRepository commentRepository, CommentMapper commentMapper) {
        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
    }

    public CommentDTO postComment(CommentDTO commentDTO) {
        CommentEntity commentEntity = commentMapper.map(commentDTO);
        this.commentRepository.save(commentMapper.map(commentDTO));
        return null;
    }

    public CommentDTO updateComment(CommentDTO commentDTO) {
        if (commentDTO.getId() == null) {
            throw new IllegalArgumentException("Comment id cannot be null");
        }
        return commentMapper.map(this.commentRepository.save(commentMapper.map(commentDTO)));
    }

}
