package com.hypertube.core_api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.dto.MovieDTO;
import com.hypertube.core_api.mapper.CommentMapper;
import com.hypertube.core_api.model.CommentEntity;
import com.hypertube.core_api.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class MovieService {

    private final RestTemplate restTemplate;
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;

    @Value("${tmdb.bearer-token}")
    private String tmdbToken;

    public MovieService(CommentRepository commentRepository, CommentMapper commentMapper) {
        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
        this.restTemplate = new RestTemplate();
    }

    public MovieDTO getMovie(Integer movieId) {
        HttpHeaders headers;
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<MovieDTO> response = restTemplate.exchange("https://api.themoviedb.org/3/movie/" + movieId + "?language=en-US&append_to_response=credits",
                HttpMethod.GET,
                entity,
                MovieDTO.class);
        return response.getBody();
    }

    public List<MovieDTO> getPopularMovie() throws JsonProcessingException {
        HttpHeaders headers;
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange("https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
                HttpMethod.GET,
                entity,
                String.class);

        ObjectMapper objectMapper = new ObjectMapper();
        List<MovieDTO> movies = null;

        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode resultsNode = rootNode.path("results");

        movies = objectMapper.convertValue(resultsNode, new TypeReference<List<MovieDTO>>() {
        });
        return movies;
    }

    public List<CommentDTO> getComments(Integer movieId) {
        return commentMapper.map(commentRepository.getCommentEntitiesByMovieId(movieId));
    }

}
