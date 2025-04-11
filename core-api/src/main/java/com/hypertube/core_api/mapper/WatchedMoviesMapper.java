package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.WatchedMoviesDTO;
import com.hypertube.core_api.model.WatchedMoviesEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface WatchedMoviesMapper {

    public WatchedMoviesDTO map(WatchedMoviesEntity entity);

    @Mapping(target = "user", ignore = true)
    public WatchedMoviesEntity map(WatchedMoviesDTO dto);

}
