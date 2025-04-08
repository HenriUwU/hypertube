package com.hypertube.core_api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.dto.MovieDTO;
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
    private final HttpHeaders headers;

    @Value("${tmdb.bearer-token}")
    private String tmdbToken;

    public MovieService() {
        this.restTemplate = new RestTemplate();
        this.headers = new HttpHeaders();
    }

    public MovieDTO getMovie(Long movieId) {
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<MovieDTO> response = restTemplate.exchange("https://api.themoviedb.org/3/movie/" + movieId + "?language=en-US&append_to_response=credits",
                HttpMethod.GET,
                entity,
                MovieDTO.class);
        return response.getBody();
    }

    public List<MovieDTO> getPopularMovie() throws JsonProcessingException {
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

}
