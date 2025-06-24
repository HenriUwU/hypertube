package com.hypertube.core_api.repository;

import com.hypertube.core_api.entity.CommentEntity;
import com.hypertube.core_api.entity.CommentLikesEntity;
import com.hypertube.core_api.entity.UserEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentLikesRepository extends CrudRepository<CommentLikesEntity, Integer> {
    CommentLikesEntity getCommentLikesEntityByCommentIdAndUserId(CommentEntity comment, UserEntity userId);
    List<CommentLikesEntity> getCommentLikesEntitiesByCommentId(CommentEntity commentId);
}
