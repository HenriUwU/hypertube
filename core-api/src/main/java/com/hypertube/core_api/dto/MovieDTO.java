package com.hypertube.core_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hypertube.core_api.model.GenreModel;
import com.hypertube.core_api.model.PersonModel;

import java.util.List;
import java.util.Map;

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

    private WatchedMoviesDTO watchedMovies;

    public static class Credits {
        public List<PersonModel> cast;
        public List<PersonModel> crew;
    }

    public Credits getCredits() {
        return credits;
    }

    public void setCredits(Credits credits) {
        this.credits = credits;
    }

    public List<Integer> getGenreIds() {
        return genreIds;
    }

    public void setGenreIds(List<Integer> genreIds) {
        this.genreIds = genreIds;
    }

    public List<GenreModel> getGenres() {
        return genres;
    }

    public void setGenres(List<GenreModel> genres) {
        this.genres = genres;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getOverview() {
        return overview;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public Integer getRuntime() {
        return runtime;
    }

    public void setRuntime(Integer runtime) {
        this.runtime = runtime;
    }

    public Map<String, String> getSubtitles() {
        return subtitles;
    }

    public void setSubtitles(Map<String, String> subtitles) {
        this.subtitles = subtitles;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public WatchedMoviesDTO getWatchedMovies() {
        return watchedMovies;
    }

    public void setWatchedMovies(WatchedMoviesDTO watchedMovies) {
        this.watchedMovies = watchedMovies;
    }
}
