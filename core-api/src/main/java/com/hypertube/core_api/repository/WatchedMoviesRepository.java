package com.hypertube.core_api.repository;

import com.hypertube.core_api.model.UserEntity;
import com.hypertube.core_api.model.WatchedMoviesEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WatchedMoviesRepository extends CrudRepository<WatchedMoviesEntity, Integer>  {
    List<WatchedMoviesEntity> getWatchedMoviesEntitiesByUserIdAndMovieId(UserEntity userId, Integer movieId);
}
