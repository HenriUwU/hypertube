package com.hypertube.core_api.repository;

import com.hypertube.core_api.model.CommentEntity;
import com.hypertube.core_api.model.CommentLikesEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentLikesRepository extends CrudRepository<CommentLikesEntity, Integer> {
    void deleteAllByCommentId(CommentEntity commentId);
}
