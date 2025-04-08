package com.hypertube.core_api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Time;

@Data
@Entity
@Table(name = "video")
public class VideoEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String title;
	private String summary;
	private Integer productionYear;
	private Time length;
	private Double imdbRating;
	private String thumbnails;
	private String casting;
}
