package com.hypertube.core_api.service;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.dto.CommentLikesDTO;
import com.hypertube.core_api.dto.UserDTO;
import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.mapper.CommentLikesMapper;
import com.hypertube.core_api.mapper.CommentMapper;
import com.hypertube.core_api.mapper.UserMapper;
import com.hypertube.core_api.entity.CommentEntity;
import com.hypertube.core_api.entity.CommentLikesEntity;
import com.hypertube.core_api.repository.CommentLikesRepository;
import com.hypertube.core_api.repository.CommentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import com.hypertube.core_api.service.CommentService;
import org.springframework.http.ResponseEntity;

import java.util.*;


@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final CommentLikesRepository commentLikesRepository;
    private final CommentLikesMapper commentLikesMapper;
    private final UserService userService;
    private final UserMapper userMapper;

    public CommentService(CommentRepository commentRepository,
                          CommentMapper commentMapper,
                          CommentLikesRepository commentLikesRepository,
                          CommentLikesMapper commentLikesMapper, UserService userService, UserMapper userMapper) {

        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
        this.commentLikesRepository = commentLikesRepository;
        this.commentLikesMapper = commentLikesMapper;
        this.userService = userService;
        this.userMapper = userMapper;
    }

    public CommentDTO postComment(CommentDTO commentDTO, String token) {
        checkCommentDTO(commentDTO);
        commentDTO.setUser(userService.getUserByToken(token));
        CommentEntity test = commentMapper.map(commentDTO);
        return commentMapper.map(commentRepository.save(test));
    }

    public CommentDTO updateComment(CommentDTO commentDTO) {
        checkCommentDTO(commentDTO);
        CommentEntity existingComment = commentRepository.findById(commentDTO.getId()).
                orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        existingComment.setContent(commentDTO.getContent());
        return commentMapper.map(commentRepository.save(existingComment));
    }

    public void deleteComment(Integer commentId, String token) {
        if (!commentRepository.existsById(commentId))
            throw new EntityNotFoundException("Comment not found");

        CommentEntity comment = commentRepository.findById(commentId).orElseThrow();
        userService.verifyUser(comment.getUser().getId(), token);
        commentRepository.deleteById(commentId);
    }

    public CommentDTO likeComment(Integer commentId, String token) {
        UserDTO user =  userService.getUserByToken(token);
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        CommentLikesDTO commentLikesDTO = new CommentLikesDTO();
        commentLikesDTO.setCommentId(commentId);
        commentLikesDTO.setUserId(user.getId());
        CommentLikesEntity commentLikes = commentLikesMapper.map(commentLikesDTO);
        commentLikesRepository.save(commentLikes);

        comment.setLikes(comment.getLikes() + 1);
        return commentMapper.map(commentRepository.save(comment));
    }

    public CommentDTO unlikeComment(Integer commentId, String token) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        UserDTO user = userService.getUserByToken(token);

        CommentLikesEntity commentLike =  commentLikesRepository.getCommentLikesEntityByCommentIdAndUserId(comment, userMapper.map(user));
        commentLikesRepository.delete(commentLike);
        comment.setLikes(comment.getLikes() - 1);
        return commentMapper.map(commentRepository.save(comment));
    }

    public List<CommentLikesDTO> getCommentLikes(CommentEntity commentEntity) {
        if (commentEntity != null) {
            return this.commentLikesMapper.map(commentLikesRepository.getCommentLikesEntitiesByCommentId(commentEntity));
        }
        return null;
    }

    public ResponseEntity<Map<String, String>> hasCurrentUserLikeComment(Integer commentId, String token) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        UserDTO user = userService.getUserByToken(token);
        UserEntity userEntity = userMapper.map(user);
        
        Map<String, String> map = new HashMap<>();
        map.put("liked", String.valueOf(this.commentLikesRepository.getCommentLikesEntityByCommentIdAndUserId(comment, userEntity) != null));
        return ResponseEntity.ok(map);
    }

    private void checkCommentDTO(CommentDTO commentDTO) {
        if (commentDTO.getMovieId() == null)
            throw new IllegalArgumentException("Movie id cannot be null");
        if (commentDTO.getContent() == null)
            throw new IllegalArgumentException("Content cannot be null");
    }

}