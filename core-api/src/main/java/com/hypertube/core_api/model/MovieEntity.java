package com.hypertube.core_api.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
public class MovieEntity {

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
	@CollectionTable(name = "movie_subtitles", joinColumns = @JoinColumn(name = "movie_id"))
	@Column(name = "subtitles")
	private Map<String, String> subtitles;

	@ManyToMany
	@JoinTable(
			name = "watched_by",
			joinColumns = @JoinColumn(name = "movie_id"),
			inverseJoinColumns = @JoinColumn(name = "user_id")
	)
	private Set<UserEntity> watchedBy;

	@ElementCollection
	@CollectionTable(name = "movie_cast", joinColumns = @JoinColumn(name = "movie_id"))
	@Column(name = "cast_member")
	private List<String> cast;

	@CreatedDate
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

}
