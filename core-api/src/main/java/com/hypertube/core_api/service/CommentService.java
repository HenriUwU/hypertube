package com.hypertube.core_api.service;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.dto.CommentLikesDTO;
import com.hypertube.core_api.mapper.CommentLikesMapper;
import com.hypertube.core_api.mapper.CommentMapper;
import com.hypertube.core_api.model.CommentEntity;
import com.hypertube.core_api.model.CommentLikesEntity;
import com.hypertube.core_api.model.UserEntity;
import com.hypertube.core_api.repository.CommentLikesRepository;
import com.hypertube.core_api.repository.CommentRepository;
import com.hypertube.core_api.repository.UserRepository;
import com.hypertube.core_api.security.JwtTokenUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final CommentLikesRepository commentLikesRepository;
    private final CommentLikesMapper commentLikesMapper;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          CommentMapper commentMapper,
                          CommentLikesRepository commentLikesRepository,
                          CommentLikesMapper commentLikesMapper, JwtTokenUtil jwtTokenUtil, UserRepository userRepository) {

        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
        this.commentLikesRepository = commentLikesRepository;
        this.commentLikesMapper = commentLikesMapper;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userRepository = userRepository;
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

    public void deleteComment(Integer commentId, String token) {
        if (!commentRepository.existsById(commentId)) {
            throw new EntityNotFoundException("Comment not found");
        }
        String username = jwtTokenUtil.extractUsername(token.replace("Bearer ", ""));
        UserEntity userEntity = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        CommentEntity comment = commentRepository.findById(commentId).orElseThrow();

        if (!userEntity.getId().equals(comment.getUserId().getId())) {
            throw new AccessDeniedException("You are not allowed to delete this comment");
        }
        List<CommentLikesEntity> commentLikes = commentLikesRepository.getCommentLikesEntitiesByCommentId(comment);
        commentLikesRepository.deleteAll(commentLikes);
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
