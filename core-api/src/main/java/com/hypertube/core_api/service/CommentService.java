package com.hypertube.core_api.service;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.dto.CommentLikesDTO;
import com.hypertube.core_api.mapper.CommentLikesMapper;
import com.hypertube.core_api.mapper.CommentMapper;
import com.hypertube.core_api.model.CommentEntity;
import com.hypertube.core_api.model.CommentLikesEntity;
import com.hypertube.core_api.repository.CommentLikesRepository;
import com.hypertube.core_api.repository.CommentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final CommentLikesRepository commentLikesRepository;
    private final CommentLikesMapper commentLikesMapper;
    private final UserService userService;

    public CommentService(CommentRepository commentRepository,
                          CommentMapper commentMapper,
                          CommentLikesRepository commentLikesRepository,
                          CommentLikesMapper commentLikesMapper, UserService userService) {

        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
        this.commentLikesRepository = commentLikesRepository;
        this.commentLikesMapper = commentLikesMapper;
        this.userService = userService;
    }

    public CommentDTO postComment(CommentDTO commentDTO, String token) {
        commentDTO.setUser(userService.getUserByToken(token));
        CommentEntity test = commentMapper.map(commentDTO);
        return commentMapper.map(commentRepository.save(test));
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

    public void deleteComment(Integer commentId, String token) {
        if (!commentRepository.existsById(commentId)) {
            throw new EntityNotFoundException("Comment not found");
        }
        CommentEntity comment = commentRepository.findById(commentId).orElseThrow();
        userService.verifyUser(comment.getUser().getId(), token);
        commentRepository.deleteById(commentId);
    }

    public CommentDTO likeComment(CommentLikesDTO commentLikesDTO) {
        CommentLikesEntity commentLikes = commentLikesMapper.map(commentLikesDTO);
        commentLikesRepository.save(commentLikes);

        CommentEntity comment = commentRepository.findById(commentLikesDTO.getCommentId())
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setLikes(comment.getLikes() + 1);
        return commentMapper.map(commentRepository.save(comment));
    }

    public CommentDTO unlikeComment(CommentLikesDTO commentLikesDTO) {
        commentLikesRepository.deleteById(commentLikesDTO.getId());

        CommentEntity comment = commentRepository.findById(commentLikesDTO.getCommentId())
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setLikes(comment.getLikes() - 1);
        return commentMapper.map(commentRepository.save(comment));
    }
}