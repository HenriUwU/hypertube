package com.hypertube.core_api.dto;

import com.hypertube.core_api.model.UserEntity;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
public class VideoDTO {

    private Long id;
    private String title;
    private Integer productionYear;
    private Integer length;
    private Double imdbRating;
    private String summary;
    private String coverImage;
    private String torrentFileUrl;
    private String filePath;
    private Map<String, String> subtitles;
    private List<String> cast;

}
