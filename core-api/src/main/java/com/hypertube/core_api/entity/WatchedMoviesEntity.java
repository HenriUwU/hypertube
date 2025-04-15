package com.hypertube.core_api.entity;

import jakarta.persistence.*;

import java.sql.Time;
import java.util.List;

@Entity
@Table(name = "watched_movies", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "movie_id"}))
public class WatchedMoviesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserEntity user;

    private Integer movieId;
    private Time stoppedAt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity userId) {
        this.user = userId;
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
