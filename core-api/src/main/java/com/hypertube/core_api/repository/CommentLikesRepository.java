package com.hypertube.core_api.repository;

import com.hypertube.core_api.model.CommentEntity;
import com.hypertube.core_api.model.CommentLikesEntity;
import com.hypertube.core_api.model.UserEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentLikesRepository extends CrudRepository<CommentLikesEntity, Integer> {
    CommentLikesEntity getCommentLikesEntityByCommentIdAndUserId(CommentEntity comment, UserEntity userId);
}
