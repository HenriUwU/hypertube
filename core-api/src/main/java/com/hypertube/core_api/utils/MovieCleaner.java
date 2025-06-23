package com.hypertube.core_api.utils;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.stream.Stream;

@Component
public class MovieCleaner {

    private static final Path BASE_DIR = Paths.get("/torrents/");
    private static final Duration expiration = Duration.ofDays(30);

    @Scheduled(cron = "0 0 0 * * *")
    public void cleanMovies() {
        try (DirectoryStream<Path> dirs = Files.newDirectoryStream(BASE_DIR)) {
            for (Path movieDir : dirs) {
                Path lastAccessFile = movieDir.resolve("last_access.txt");

                if (!Files.exists(lastAccessFile)) {
                    continue;
                }

                try {
                    String timestamp = Files.readString(lastAccessFile).trim();
                    Instant lastAccessTime = Instant.parse(timestamp);

                    if (lastAccessTime.isBefore(Instant.now().minus(expiration))) {
                        deleteDirectoryRecursively(movieDir);
                    }
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void deleteDirectoryRecursively(Path path) throws IOException {
        try (Stream<Path> walk = Files.walk(path)) {
            walk.sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(file -> {
                        if (!file.delete()) {
                            System.err.println("Error during cleaning : " + file.getAbsolutePath());
                        }
                    });
        }
    }

}
