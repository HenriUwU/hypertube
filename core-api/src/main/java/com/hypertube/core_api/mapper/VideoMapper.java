package com.hypertube.core_api.mapper;

import com.hypertube.core_api.dto.VideoDTO;
import com.hypertube.core_api.model.VideoEntity;
import org.mapstruct.Mapper;

@Mapper
public interface VideoMapper {

    VideoDTO map(VideoEntity videoEntity);
    VideoEntity map(VideoDTO videoDTO);

}
