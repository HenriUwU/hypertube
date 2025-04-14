package com.hypertube.core_api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hypertube.core_api.dto.*;
import com.hypertube.core_api.model.MovieModel;
import com.hypertube.core_api.model.SearchModel;
import com.hypertube.core_api.model.SortByModel;
import com.hypertube.core_api.model.SubtitleModel;
import com.hypertube.core_api.service.MovieService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

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

    @GetMapping("/{tmdbId}/subtitles")
    public List<SubtitleModel> getSubtitles(@PathVariable String tmdbId) throws IOException {
        return this.movieService.getSubtitles(tmdbId);
    }

}
