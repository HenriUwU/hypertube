package com.hypertube.core_api.repository;

import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.entity.WatchedMoviesEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WatchedMoviesRepository extends CrudRepository<WatchedMoviesEntity, Integer>  {
    WatchedMoviesEntity getWatchedMoviesEntityByUserAndMovieId(UserEntity user, Integer movieId);
}
