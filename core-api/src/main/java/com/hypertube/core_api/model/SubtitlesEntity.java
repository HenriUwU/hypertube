package com.hypertube.core_api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "subtitles")
public class SubtitlesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "video_id", referencedColumnName = "id", nullable = false)
    private VideoEntity videoId;

    private String language;
    private String content;

}
