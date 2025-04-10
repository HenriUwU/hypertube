package com.hypertube.core_api.dto;

import java.sql.Time;

public class WatchedMoviesDTO {
    private Integer id;
    private Integer movieId;
    private Time stoppedAt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getMovieId() {
        return movieId;
    }

    public void setMovieId(Integer movieId) {
        this.movieId = movieId;
    }

    public Time getStoppedAt() {
        return stoppedAt;
    }

    public void setStoppedAt(Time stoppedAt) {
        this.stoppedAt = stoppedAt;
    }
}
