package com.hypertube.core_api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.dto.MovieDTO;
import com.hypertube.core_api.dto.SearchDTO;
import com.hypertube.core_api.dto.SortByDTO;
import com.hypertube.core_api.mapper.CommentMapper;
import com.hypertube.core_api.mapper.WatchedMoviesMapper;
import com.hypertube.core_api.model.UserEntity;
import com.hypertube.core_api.model.WatchedMoviesEntity;
import com.hypertube.core_api.repository.CommentRepository;
import com.hypertube.core_api.repository.UserRepository;
import com.hypertube.core_api.repository.WatchedMoviesRepository;
import com.hypertube.core_api.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private final RestTemplate restTemplate;
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final WatchedMoviesRepository watchedMoviesRepository;
    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final WatchedMoviesMapper watchedMoviesMapper;

    @Value("${tmdb.bearer-token}")
    private String tmdbToken;

    public MovieService(CommentRepository commentRepository, CommentMapper commentMapper, WatchedMoviesRepository watchedMoviesRepository, UserRepository userRepository, JwtTokenUtil jwtTokenUtil, WatchedMoviesMapper watchedMoviesMapper) {
        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
        this.watchedMoviesRepository = watchedMoviesRepository;
        this.watchedMoviesMapper = watchedMoviesMapper;
        this.restTemplate = new RestTemplate();
        this.userRepository = userRepository;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    public MovieDTO getMovie(Integer movieId, String token) throws JsonProcessingException {
        HttpHeaders headers;
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<MovieDTO> response = restTemplate.exchange("https://api.themoviedb.org/3/movie/" + movieId + "?language=en-US&append_to_response=credits",
                HttpMethod.GET,
                entity,
                MovieDTO.class);

        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        MovieDTO movie = response.getBody();
        if (movie != null) {
            movie.setThumbnail("https://image.tmdb.org/t/p/original" + movie.getThumbnail());
            movie.setReleaseYear(movie.getReleaseYear().substring(0, 4));
            Optional.ofNullable(watchedMoviesRepository.getWatchedMoviesEntityByUserAndMovieId(userEntity, movie.getId()))
                    .map(WatchedMoviesEntity::getStoppedAt)
                    .ifPresent(movie::setStoppedAt);
        }
        return movie;
    }

    public List<MovieDTO> sortByMovies(SortByDTO sortByDTO, String token) throws JsonProcessingException {
        HttpHeaders headers;
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange("https://api.themoviedb.org/3/movie/" + sortByDTO.getSortBy() + "?language=en-US&page=" + sortByDTO.getPage(),
                HttpMethod.GET,
                entity,
                String.class);

        List<Integer> selectedGenreIds = sortByDTO.getGenresIds();
        return sortMovieByGenre(response, selectedGenreIds, token);
    }

    public List<MovieDTO> searchMovies(SearchDTO searchDTO, String token) throws JsonProcessingException {
        HttpHeaders headers;
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange("https://api.themoviedb.org/3/search/movie?query=" + searchDTO.getQuery() + "&language=en-US&page=" + searchDTO.getPage(),
                HttpMethod.GET,
                entity,
                String.class);

        List<Integer> selectedGenreIds = searchDTO.getGenresIds();
        return sortMovieByGenre(response, selectedGenreIds, token);
    }

    private List<MovieDTO> sortMovieByGenre(ResponseEntity<String> response, List<Integer> selectedGenreIds, String token) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode resultsNode = rootNode.path("results");

        List<MovieDTO> movies = objectMapper.convertValue(resultsNode, new TypeReference<>() {});

        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        return movies.stream()
                .filter(movie ->  selectedGenreIds.isEmpty()
                        || (movie.getGenreIds() != null && !Collections.disjoint(movie.getGenreIds(), selectedGenreIds)))
                .peek(movie -> movie.setThumbnail("https://image.tmdb.org/t/p/original" + movie.getThumbnail()))
                .peek(movie -> movie.setReleaseYear(movie.getReleaseYear().substring(0, 4)))
                .peek(movie -> Optional.ofNullable(watchedMoviesRepository.getWatchedMoviesEntityByUserAndMovieId(userEntity, movie.getId()))
                        .map(WatchedMoviesEntity::getStoppedAt)
                        .ifPresent(movie::setStoppedAt))
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getComments(Integer movieId) {
        return commentMapper.map(commentRepository.getCommentEntitiesByMovieId(movieId));
    }

}
