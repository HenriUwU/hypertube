package com.hypertube.core_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hypertube.core_api.model.PersonModel;
import com.hypertube.core_api.model.GenreModel;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MovieDTO {

    private Integer id;
    private String title;
    private String overview;

    @JsonProperty("vote_average")
    private Double rating;

    @JsonProperty("release_date")
    private String releaseDate;

    @JsonProperty("poster_path")
    private String thumbnail;

    @JsonProperty("genre_ids")
    private List<Integer> genreIds;

    private Integer runtime;
    private List<GenreModel> genres;
    private Credits credits;
    private Map<String, String> subtitles;

    public static class Credits {
        public List<PersonModel> cast;
        public List<PersonModel> crew;
    }
}
