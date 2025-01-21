package com.hypertube.core_api.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "video")
public class VideoEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String title;
	private Integer productionYear;
	private Integer length;
	private Double imdbRating;
	private String summary;
	private String coverImage;
	private String torrentFileUrl;
	private String filePath;

	@ElementCollection
	@CollectionTable(name = "video_subtitles", joinColumns = @JoinColumn(name = "movie_id"))
	@Column(name = "subtitles")
	private Map<String, String> subtitles;

	@ElementCollection
	@CollectionTable(name = "video_cast", joinColumns = @JoinColumn(name = "movie_id"))
	@Column(name = "cast_member")
	private List<String> cast;

	@CreatedDate
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

}
