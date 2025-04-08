package com.hypertube.core_api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hypertube.core_api.dto.MovieDTO;
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
    public MovieDTO getMovie(@PathVariable Long id) {
        return this.movieService.getMovie(id);
    }

    @GetMapping(path = "/popular")
    public List<MovieDTO> getPopularMovie() throws JsonProcessingException {
        return this.movieService.getPopularMovie();
    }

}
