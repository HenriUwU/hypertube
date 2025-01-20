package com.hypertube.core_api.dto;

import lombok.Data;

@Data
public class CommentDTO {

    private Long id;
    private VideoDTO video;
    private UserDTO user;
    private String content;

}
