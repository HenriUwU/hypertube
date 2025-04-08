package com.hypertube.core_api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "subtitles")
public class SubtitlesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer movieId;

    private String language;
    private String content;

}
