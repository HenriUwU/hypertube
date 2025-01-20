package com.hypertube.core_api.repository;

import com.hypertube.core_api.model.VideoEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends CrudRepository<VideoEntity, Long> {
}
