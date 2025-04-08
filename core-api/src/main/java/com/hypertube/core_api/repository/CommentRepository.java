package com.hypertube.core_api.repository;

import com.hypertube.core_api.model.CommentEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends CrudRepository<CommentEntity, Integer> {

    List<CommentEntity> getCommentEntitiesByMovieId(Integer movieId);

}
