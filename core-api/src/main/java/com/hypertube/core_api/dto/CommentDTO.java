package com.hypertube.core_api.dto;

import com.hypertube.core_api.model.UserEntity;
import lombok.Data;

@Data
public class CommentDTO {

    private Long id;
    private Long movieId;
    private Long userId;
    private String content;

}
