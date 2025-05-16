package com.hypertube.core_api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hypertube.core_api.dto.*;
import com.hypertube.core_api.model.*;
import com.hypertube.core_api.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping(path = "/{id}")
    public MovieModel getMovie(@PathVariable Integer id, @RequestHeader("Authorization") String token) throws IOException {
        return this.movieService.getMovie(id, token);
    }

    @PostMapping("/watched")
    public WatchedMoviesDTO addWatched(@RequestBody WatchedMoviesDTO watchedMoviesDTO, @RequestHeader("Authorization") String token) throws JsonProcessingException {
        return this.movieService.addWatched(watchedMoviesDTO, token);
    }

    @PutMapping("/watched")
    public WatchedMoviesDTO modifyWatched(@RequestBody WatchedMoviesDTO watchedMoviesDTO, @RequestHeader("Authorization") String token) throws JsonProcessingException {
        return this.movieService.modifyWatched(watchedMoviesDTO, token);
    }

    @PostMapping(path = "/sort-by")
    public List<MovieModel> sortByMovies(@RequestBody SortByModel sortByDTO, @RequestHeader("Authorization") String token) throws JsonProcessingException {
        return this.movieService.sortByMovies(sortByDTO, token);
    }

    @PostMapping(path = "/search")
    public List<MovieModel> searchMovies(@RequestBody SearchModel searchDTO, @RequestHeader("Authorization") String token) throws JsonProcessingException {
        return this.movieService.searchMovies(searchDTO, token);
    }

    @GetMapping(path = "/{id}/comments")
    public List<CommentDTO> getComments(@PathVariable Integer id) {
        return this.movieService.getComments(id);
    }

    @GetMapping("/{imdbId}/subtitles")
    public List<SubtitleModel> getSubtitles(@PathVariable String imdbId) throws IOException {
        return this.movieService.getSubtitles(imdbId);
    }

    @GetMapping("/{id}/trailer")
    public ResponseEntity<Map<String, String>> getTrailers(@PathVariable Integer id, @RequestHeader("Authorization") String token) {
        return this.movieService.getTrailers(id, token);
    }

    @GetMapping("/genres")
    public List<GenreModel> getGenres(@RequestHeader("Authorization") String token) throws JsonProcessingException {
        return this.movieService.getGenres(token);
    }
}
