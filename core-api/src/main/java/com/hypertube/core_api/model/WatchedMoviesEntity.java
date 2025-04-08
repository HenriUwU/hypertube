package com.hypertube.core_api.model;

import jakarta.persistence.*;

import java.sql.Time;

@Entity
@Table(name = "watched_movies", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "movie_id"}))
public class WatchedMoviesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserEntity userId;

    private Integer movieId;
    private Time stoppedAt;

}
