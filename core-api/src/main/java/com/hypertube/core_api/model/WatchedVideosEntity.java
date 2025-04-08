package com.hypertube.core_api.model;

import jakarta.persistence.*;

import java.sql.Time;

@Entity
@Table(name = "watched_videos", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "video_id"}))
public class WatchedVideosEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserEntity userId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "video_id", referencedColumnName = "id", nullable = false)
    private VideoEntity videoId;

    private Time stoppedAt;

}
