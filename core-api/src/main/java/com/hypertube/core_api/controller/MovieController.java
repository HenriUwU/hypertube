package com.hypertube.core_api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.dto.MovieDTO;
import com.hypertube.core_api.dto.SearchDTO;
import com.hypertube.core_api.dto.SortByDTO;
import com.hypertube.core_api.service.MovieService;
import org.springframework.web.bind.annotation.*;

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
    public MovieDTO getMovie(@PathVariable Integer id, @RequestHeader("Authorization") String token) throws JsonProcessingException {
        return this.movieService.getMovie(id, token);
    }

    @PostMapping(path = "/sort-by")
    public List<MovieDTO> sortByMovies(@RequestBody SortByDTO sortByDTO, @RequestHeader("Authorization") String token) throws JsonProcessingException {
        return this.movieService.sortByMovies(sortByDTO, token);
    }

    @PostMapping(path = "/search")
    public List<MovieDTO> searchMovies(@RequestBody SearchDTO searchDTO, @RequestHeader("Authorization") String token) throws JsonProcessingException {
        return this.movieService.searchMovies(searchDTO, token);
    }

    @GetMapping(path = "/{id}/comments")
    public List<CommentDTO> getComments(@PathVariable Integer id) {
        return this.movieService.getComments(id);
    }

}
