package com.hypertube.core_api.model;

import jakarta.persistence.*;

import java.sql.Time;

@Entity
@Table(name = "watched_movies", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "movie_id"}))
public class WatchedMoviesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserEntity userId;

    private Integer movieId;
    private Time stoppedAt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public UserEntity getUserId() {
        return userId;
    }

    public void setUserId(UserEntity userId) {
        this.userId = userId;
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
