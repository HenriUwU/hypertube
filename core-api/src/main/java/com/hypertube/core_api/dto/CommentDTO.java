package com.hypertube.core_api.dto;

import com.hypertube.core_api.model.UserEntity;
import lombok.Data;

import java.time.LocalDateTime;

public class CommentDTO {

    private Integer id;
    private Integer movieId;
    private UserEntity userId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getMovieId() {
        return movieId;
    }

    public void setMovieId(Integer movieId) {
        this.movieId = movieId;
    }

    public UserEntity getUserId() {
        return userId;
    }

    public void setUserId(UserEntity userId) {
        this.userId = userId;
    }

}
