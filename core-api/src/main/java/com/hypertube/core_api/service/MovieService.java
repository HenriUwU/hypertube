package com.hypertube.core_api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.dto.*;
import com.hypertube.core_api.mapper.CommentMapper;
import com.hypertube.core_api.mapper.WatchedMoviesMapper;
import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.entity.WatchedMoviesEntity;
import com.hypertube.core_api.model.MovieModel;
import com.hypertube.core_api.model.SearchModel;
import com.hypertube.core_api.model.SortByModel;
import com.hypertube.core_api.model.SubtitleModel;
import com.hypertube.core_api.repository.CommentRepository;
import com.hypertube.core_api.repository.UserRepository;
import com.hypertube.core_api.repository.WatchedMoviesRepository;
import com.hypertube.core_api.security.JwtTokenUtil;
import jakarta.persistence.EntityNotFoundException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
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
    private final WatchedMoviesMapper watchedMoviesMapper;
    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;

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

    public MovieModel getMovie(Integer movieId, String token) throws IOException {
        HttpHeaders headers;
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<MovieModel> response = restTemplate.exchange("https://api.themoviedb.org/3/movie/" + movieId + "?language=en-US&append_to_response=credits",
                HttpMethod.GET,
                entity,
                MovieModel.class);

        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        MovieModel movie = response.getBody();
        if (movie != null) {
            movie.setThumbnail("https://image.tmdb.org/t/p/original" + movie.getThumbnail());
            movie.setReleaseDate(movie.getReleaseDate().substring(0, 4));
            Optional.ofNullable(watchedMoviesRepository.getWatchedMoviesEntityByUserAndMovieId(userEntity, movie.getId()))
                    .map(WatchedMoviesEntity::getStoppedAt)
                    .ifPresent(movie::setStoppedAt);
        }
        return movie;
    }

    public WatchedMoviesDTO addWatched(WatchedMoviesDTO watchedMoviesDTO, String token) {
        checkWatchedMoviesDTO(watchedMoviesDTO);
        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        WatchedMoviesEntity entity = watchedMoviesMapper.map(watchedMoviesDTO);
        entity.setUser(userEntity);
        return watchedMoviesMapper.map(watchedMoviesRepository.save(entity));
    }

    public WatchedMoviesDTO modifyWatched(WatchedMoviesDTO watchedMoviesDTO, String token) {
        checkWatchedMoviesDTO(watchedMoviesDTO);
        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        WatchedMoviesEntity watchedMoviesEntity = watchedMoviesRepository.getWatchedMoviesEntityByUserAndMovieId(userEntity, watchedMoviesDTO.getMovieId());
        if (watchedMoviesEntity == null) {
            throw new EntityNotFoundException("Watched movie not found");
        }
        watchedMoviesEntity.setStoppedAt(watchedMoviesDTO.getStoppedAt());
        return watchedMoviesMapper.map(watchedMoviesRepository.save(watchedMoviesEntity));
    }

    public List<MovieModel> sortByMovies(SortByModel sortByDTO, String token) throws JsonProcessingException {
        checkSortByDTO(sortByDTO);
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

    public List<MovieModel> searchMovies(SearchModel searchDTO, String token) throws JsonProcessingException {
        checkSearchDTO(searchDTO);
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

    private List<MovieModel> sortMovieByGenre(ResponseEntity<String> response, List<Integer> selectedGenreIds, String token) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode resultsNode = rootNode.path("results");

        List<MovieModel> movies = objectMapper.convertValue(resultsNode, new TypeReference<>() {});

        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        return movies.stream()
                .filter(movie ->  selectedGenreIds.isEmpty()
                        || (movie.getGenreIds() != null && !Collections.disjoint(movie.getGenreIds(), selectedGenreIds)))
                .peek(movie -> movie.setThumbnail("https://image.tmdb.org/t/p/original" + movie.getThumbnail()))
                .peek(movie -> movie.setReleaseDate(movie.getReleaseDate().substring(0, 4)))
                .peek(movie -> Optional.ofNullable(watchedMoviesRepository.getWatchedMoviesEntityByUserAndMovieId(userEntity, movie.getId()))
                        .map(WatchedMoviesEntity::getStoppedAt)
                        .ifPresent(movie::setStoppedAt))
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getComments(Integer movieId) {
        return commentMapper.map(commentRepository.getCommentEntitiesByMovieId(movieId));
    }

    public List<SubtitleModel> getSubtitles(String imdb_id) throws IOException {
        List<SubtitleModel> subtitles = new ArrayList<>();
        Document doc = Jsoup.connect("https://www.opensubtitles.org/en/search/sublanguageid-all/imdbid-" + imdb_id)
                .timeout(10000)
                .get();

        Element subtitleTable = doc.getElementById("search_results");

        if (subtitleTable != null) {
            Elements rows = subtitleTable.select("tr");

            for (Element row : rows) {
                Elements tds = row.select("td");

                if (tds.size() >= 5) {
                    Element spanWithTitle = tds.get(0).selectFirst("span[title]");
                    String title = (spanWithTitle != null) ? spanWithTitle.attr("title") : null;

                    Element langAnchor = tds.get(1).selectFirst("a[title]");
                    String language = (langAnchor != null) ? langAnchor.attr("title") : null;

                    String href = tds.get(4).select("a").attr("href");
                    if (!href.isEmpty()) {
                        String fullUrl = "https://www.opensubtitles.org" + href;
                        subtitles.add(new SubtitleModel(title, language, fullUrl));
                    }
                }
            }
        }

        return subtitles;
    }

    private void checkSortByDTO(SortByModel sortByDTO) {
        if (sortByDTO.getSortBy() == null)
            throw new IllegalArgumentException("sortBy cannot be null");
        if (sortByDTO.getPage() == null)
            throw new IllegalArgumentException("Page cannot be null");
        if (sortByDTO.getPage() < 1)
            throw new IllegalArgumentException("Page cannot be negative or zero");
        if (sortByDTO.getGenresIds() == null)
            throw new IllegalArgumentException("genresIds cannot be null");
    }

    private void checkSearchDTO(SearchModel searchDTO) {
        if (searchDTO.getQuery() == null)
            throw new IllegalArgumentException("query cannot be null");
        if (searchDTO.getPage() == null)
            throw new IllegalArgumentException("Page cannot be null");
        if (searchDTO.getPage() < 1)
            throw new IllegalArgumentException("Page cannot be negative or zero");
        if (searchDTO.getGenresIds() == null)
            throw new IllegalArgumentException("genresIds cannot be null");
    }

    private void checkWatchedMoviesDTO(WatchedMoviesDTO watchedMoviesDTO) {
        if (watchedMoviesDTO.getMovieId() == null)
            throw new IllegalArgumentException("movie id cannot be null");
        if (watchedMoviesDTO.getStoppedAt() == null)
            throw new IllegalArgumentException("stoppedAt cannot be null");
    }
}
