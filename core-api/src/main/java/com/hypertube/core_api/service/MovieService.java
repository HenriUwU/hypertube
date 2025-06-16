package com.hypertube.core_api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.dto.WatchedMoviesDTO;
import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.entity.WatchedMoviesEntity;
import com.hypertube.core_api.mapper.CommentMapper;
import com.hypertube.core_api.mapper.WatchedMoviesMapper;
import com.hypertube.core_api.model.*;
import com.hypertube.core_api.repository.CommentRepository;
import com.hypertube.core_api.repository.UserRepository;
import com.hypertube.core_api.repository.WatchedMoviesRepository;
import com.hypertube.core_api.security.JwtTokenUtil;
import jakarta.persistence.EntityNotFoundException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.mozilla.universalchardet.UniversalDetector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

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
        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        ResponseEntity<MovieModel> response = restTemplate.exchange("https://api.themoviedb.org/3/movie/" + movieId + "?language=" + userEntity.getLanguage() + "&append_to_response=credits",
                HttpMethod.GET,
                entity,
                MovieModel.class);

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

    public List<MovieModel> sortByMovies(SortByModel sortByModel, String token) throws JsonProcessingException {
        checkSortByDTO(sortByModel);
        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        HttpHeaders headers;
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange("https://api.themoviedb.org/3/movie/" + sortByModel.getSortBy() + "?language=" + userEntity.getLanguage() + "&page=" + sortByModel.getPage(),
                HttpMethod.GET,
                entity,
                String.class);

        return sortMovieByGenre(response, sortByModel.getGenresIds(), sortByModel.getMinStars(), token);
    }

    public List<GenreModel> getGenres(String token) throws JsonProcessingException {
        HttpHeaders headers;
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();

        ResponseEntity<GenresResponse> response = restTemplate.exchange(
                "https://api.themoviedb.org/3/genre/movie/list?language=" + userEntity.getLanguage(),
                HttpMethod.GET,
                entity,
                GenresResponse.class
        );
        return response.getBody().getGenres();
    }


    public List<MovieModel> searchMovies(SearchModel searchModel, String token) throws JsonProcessingException {
        checkSearchDTO(searchModel);
        HttpHeaders headers;
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();

        ResponseEntity<String> response = restTemplate.exchange("https://api.themoviedb.org/3/search/movie?query=" + searchModel.getQuery() + "&language=" + userEntity.getLanguage() + "&primary_release_year=" + searchModel.getProductionYear() + "&page=" + searchModel.getPage(),
                HttpMethod.GET,
                entity,
                String.class);

        return sortMovieByGenre(response, searchModel.getGenresIds(), searchModel.getMinStars(), token);
    }

    private List<MovieModel> sortMovieByGenre(ResponseEntity<String> response, List<Integer> selectedGenreIds, Integer minStars, String token) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode resultsNode = rootNode.path("results");

        List<MovieModel> movies = objectMapper.convertValue(resultsNode, new TypeReference<>() {});

        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        return movies.stream()
                .filter(movie ->  selectedGenreIds.isEmpty()
                        || (movie.getGenreIds() != null && !Collections.disjoint(movie.getGenreIds(), selectedGenreIds)))
                .filter(movie -> movie.getVoteAverage() != null && movie.getVoteAverage() >= minStars)
                .peek(movie -> movie.setThumbnail("https://image.tmdb.org/t/p/original" + movie.getThumbnail()))
                .peek(movie -> movie.setReleaseDate(
                        (movie.getReleaseDate() != null && movie.getReleaseDate().length() >= 4)
                                ? movie.getReleaseDate().substring(0, 4)
                                : ""
                ))
                .peek(movie -> Optional.ofNullable(watchedMoviesRepository.getWatchedMoviesEntityByUserAndMovieId(userEntity, movie.getId()))
                        .map(WatchedMoviesEntity::getStoppedAt)
                        .ifPresent(movie::setStoppedAt))
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getComments(Integer movieId) {
        return commentMapper.map(commentRepository.getCommentEntitiesByMovieId(movieId));
    }

    public List<SubtitleModel> getSubtitles(String imdbId) throws IOException {
        List<SubtitleModel> subtitles = new ArrayList<>();
        String baseUrl = "https://yts-subs.com";
        String url = baseUrl + "/movie-imdb/" + imdbId;

        // Load the main subtitle page
        Document doc = Jsoup.connect(url)
                .timeout(10000)
                .userAgent("Mozilla/5.0")
                .get();

        Elements rows = doc.select("table.other-subs tbody tr");

        int subtitles_cnt = 1;
        for (Element row : rows) {
            Element langCell = row.selectFirst(".sub-lang");
            if (langCell == null) continue;

            String language = langCell.text().trim().toLowerCase();
            if (!language.equals("french") && !language.equals("english")) continue;
//&& !language.equals("english")
            Element linkElement = row.selectFirst("a[href^=/subtitles/]");
            if (linkElement == null) continue;

            String detailHref = linkElement.attr("href");
            String detailUrl = baseUrl + detailHref;

            Document detailDoc = Jsoup.connect(detailUrl)
                    .timeout(10000)
                    .userAgent("Mozilla/5.0")
                    .get();

            Element downloadButton = detailDoc.selectFirst("#btn-download-subtitle");
            if (downloadButton == null) continue;

            String encodedLink = downloadButton.attr("data-link");

            List<Path> subtitleFiles = downloadSubtitle(encodedLink, imdbId);

            for (Path filePath : subtitleFiles) {
                if (!Files.exists(filePath))
                    continue;

                String fileUrl = filePath.toString();
                if (subtitles.stream().anyMatch(subtitle -> subtitle.getUrl().equals(fileUrl)))
                    continue;

                String title = "sub-" + subtitles_cnt + "-" + language;
                subtitles.add(new SubtitleModel(title, language, filePath.toString()));
                subtitles_cnt++;
            }
        }
        return subtitles;
    }

    public ResponseEntity<Map<String, String>> getTrailers(Integer id, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        UserEntity userEntity = userRepository
                .findByUsername(jwtTokenUtil.extractUsername(token.substring(7)))
                .orElseThrow();

        TrailerModel trailer = fetchTrailer(id, userEntity.getLanguage(), entity);

        if (trailer == null) {
            trailer = fetchTrailer(id, "en", entity);
        }

        Map<String, String> trailers = new HashMap<>();
        if (trailer != null) {
            String youtubeUrl = "https://www.youtube.com/embed/" + trailer.getKey();
            trailers.put("link", youtubeUrl);
            return ResponseEntity.ok(trailers);
        } else {
            trailers.put("error", "No trailer found in user language or English.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(trailers);
        }
    }

    private TrailerModel fetchTrailer(Integer movieId, String language, HttpEntity<String> entity) {
        ResponseEntity<TrailersModel> response = restTemplate.exchange(
                "https://api.themoviedb.org/3/movie/" + movieId + "/videos?language=" + language,
                HttpMethod.GET,
                entity,
                TrailersModel.class
        );

        return response.getBody().getResults().stream()
                .filter(t -> "Trailer".equalsIgnoreCase(t.getType()) && "YouTube".equalsIgnoreCase(t.getSite()))
                .findFirst()
                .orElse(null);
    }

    private List<Path> downloadSubtitle(String encodedLink, String imdb_id) throws IOException {
        String downloadUrl = new String(Base64.getDecoder().decode(encodedLink), StandardCharsets.UTF_8);
        String fileName = Paths.get(new URL(downloadUrl).getPath()).getFileName().toString();
        Path outputDir = Paths.get("/torrents/subs/" + imdb_id);
        Files.createDirectories(outputDir);
        Path zipPath = outputDir.resolve(fileName);

        try (InputStream in = new URL(downloadUrl).openStream()) {
            Files.copy(in, zipPath, StandardCopyOption.REPLACE_EXISTING);
        }

        List<Path> extractedFiles = new ArrayList<>();
        try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(zipPath))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                Path extractedPath = outputDir.resolve(entry.getName());

                if (entry.isDirectory()) {
                    Files.createDirectories(extractedPath);
                } else {
                    Files.createDirectories(extractedPath.getParent());
                    Files.copy(zis, extractedPath, StandardCopyOption.REPLACE_EXISTING);

                    if (extractedPath.toString().toLowerCase().endsWith(".srt")) {
                        Path vttPath = replaceExtension(extractedPath, ".vtt");
                        if (convertSrtToVtt(extractedPath, vttPath))
                            extractedFiles.add(vttPath);
                    } else if (extractedPath.toString().toLowerCase().endsWith(".txt")) {
                        Path vttPath = replaceExtension(extractedPath, ".vtt");
                        if (convertTxtToVtt(extractedPath, vttPath, 25.0))
                            extractedFiles.add(vttPath);
                    }
                }
                zis.closeEntry();
            }
        }
        Files.deleteIfExists(zipPath);
        return extractedFiles;
    }

    public boolean convertSrtToVtt(Path srtPath, Path vttPath) throws IOException {
        String encoding = detectEncoding(srtPath.toString());

        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg",
                "-y",
                "-sub_charenc", encoding,
                "-i", srtPath.toString(),
                "-c", "webvtt",
                vttPath.toString()
        );

        return launchFfmpegSubtitle(processBuilder, srtPath, vttPath);
    }

    public boolean convertTxtToVtt(Path txtPath, Path vttPath, Double frameRate) throws IOException {
        String encoding = detectEncoding(txtPath.toString());

        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg",
                "-y",
                "-subfps", frameRate.toString(),
                "-sub_charenc", encoding,
                "-f", "microdvd",
                "-i", txtPath.toString(),
                "-c", "webvtt",
                vttPath.toString()
        );
        return launchFfmpegSubtitle(processBuilder, txtPath, vttPath);
    }

    private boolean launchFfmpegSubtitle(ProcessBuilder processBuilder, Path inputPath, Path outputPath) throws IOException {
        System.out.println(processBuilder.command());
        processBuilder.redirectErrorStream(true);

        try {
            Process process = processBuilder.start();

            Thread outputConsumer = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
            outputConsumer.start();

            int exitCode = process.waitFor();
//            Files.deleteIfExists(inputPath);
            if (exitCode != 0)
                Files.deleteIfExists(outputPath);
            return exitCode == 0;
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            Files.deleteIfExists(inputPath);
            Files.deleteIfExists(outputPath);
            return false;
        }
    }
    private Path replaceExtension(Path originalPath, String newExtension) {
        String fileName = originalPath.getFileName().toString();
        int dotIndex = fileName.lastIndexOf('.');
        String newName = (dotIndex != -1 ? fileName.substring(0, dotIndex) : fileName) + newExtension;
        return originalPath.getParent().resolve(newName);
    }

    public static String detectEncoding(String filePath) {
        byte[] buf = new byte[4096];
        try (FileInputStream fis = new FileInputStream(filePath)) {
            UniversalDetector detector = new UniversalDetector(null);

            int nread;
            while ((nread = fis.read(buf)) > 0 && !detector.isDone()) {
                detector.handleData(buf, 0, nread);
            }

            detector.dataEnd();
            String encoding = detector.getDetectedCharset();
            detector.reset();
            return encoding != null ? encoding : "UTF-8"; // fallback to UTF-8
        } catch (IOException e) {
            e.printStackTrace();
            return "UTF-8";
        }
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
