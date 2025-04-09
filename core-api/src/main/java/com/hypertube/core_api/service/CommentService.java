package com.hypertube.core_api.service;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.mapper.CommentMapper;
import com.hypertube.core_api.model.CommentEntity;
import com.hypertube.core_api.repository.CommentRepository;
import jakarta.persistence.EntityNotFoundException;
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
        return commentMapper.map(commentRepository.save(commentMapper.map(commentDTO)));
    }

    public CommentDTO updateComment(CommentDTO commentDTO) {
        if (commentDTO.getId() == null) {
            throw new IllegalArgumentException("Comment id cannot be null");
        }
        CommentEntity existingComment = commentRepository.findById(commentDTO.getId()).
                orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        existingComment.setContent(commentDTO.getContent());
        return commentMapper.map(commentRepository.save(existingComment));
    }

}
