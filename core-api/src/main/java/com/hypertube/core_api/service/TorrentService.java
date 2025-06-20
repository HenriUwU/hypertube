package com.hypertube.core_api.service;

import com.hypertube.core_api.model.TorrentModel;
import org.apache.tika.utils.StringUtils;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TorrentService {

	private final RestTemplate restTemplate;

	public TorrentService() {
		this.restTemplate = new RestTemplate();
	}

	public List<TorrentModel> searchTorrent(String searchTerm) {
		ResponseEntity<List<TorrentModel>> responseEntity1 = restTemplate.exchange(
				"http://torrent-scraping:3001/api/piratebay/" + searchTerm,
				HttpMethod.GET,
				HttpEntity.EMPTY,
                new ParameterizedTypeReference<>() {}
		);

		ResponseEntity<List<TorrentModel>> responseEntity2 = restTemplate.exchange(
				"http://torrent-scraping:3001/api/nyaasi/" + searchTerm,
				HttpMethod.GET,
				HttpEntity.EMPTY,
                new ParameterizedTypeReference<>() {}
		);

		ResponseEntity<List<TorrentModel>> responseEntity3 = restTemplate.exchange(
				"http://torrent-scraping:3001/api/glodls/" + searchTerm,
				HttpMethod.GET,
				HttpEntity.EMPTY,
				new ParameterizedTypeReference<>() {}
		);

		List<TorrentModel> combinedResults = new ArrayList<>();
		combinedResults.addAll(Optional.ofNullable(responseEntity1.getBody()).orElse(Collections.emptyList()));
		combinedResults.addAll(Optional.ofNullable(responseEntity2.getBody()).orElse(Collections.emptyList()));
		combinedResults.addAll(Optional.ofNullable(responseEntity3.getBody()).orElse(Collections.emptyList()));

		if (combinedResults.isEmpty()) {
			ResponseEntity<List<TorrentModel>> responseEntity4 = restTemplate.exchange(
					"http://torrent-scraping:3001/api/all/" + searchTerm,
					HttpMethod.GET,
					HttpEntity.EMPTY,
					new ParameterizedTypeReference<>() {}
			);
			combinedResults.addAll(Optional.ofNullable(responseEntity4.getBody()).orElse(Collections.emptyList()));
		}

		combinedResults.sort((a, b) -> {
			int seedersA = parseIntSafe(a.getSeeders());
			int seedersB = parseIntSafe(b.getSeeders());
			return Integer.compare(seedersB, seedersA);
		});

		return combinedResults;
	}

	private int parseIntSafe(String value) {
		if (StringUtils.isBlank(value)) {
			return -1;
		}
		try {
			return Integer.parseInt(value.trim());
		} catch (NumberFormatException e) {
			return -1;
		}
	}

	public String startDownload(TorrentModel torrentModel) {
		if (torrentModel.getMagnet() == null) {
			throw new IllegalArgumentException("Torrent model must have magnet");
		}
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		String jsonPayload = "{\"magnet\":\"" + torrentModel.getMagnet() + "\"}";
		HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

		restTemplate.exchange(
				"http://torrent-downloader:5001/download",
				HttpMethod.POST,
				entity,
				String.class
		);
		return extractInfoHash(torrentModel.getMagnet());
	}

	public String waitForPlaylist(String hash, Duration timeout) {
		Path playlistPath = Paths.get("/torrents/", hash, "hls", "playlist.m3u8");
		long startTime = System.currentTimeMillis();
		long timeoutMs = timeout.toMillis();

		while (!Files.exists(playlistPath)) {
			if (System.currentTimeMillis() - startTime > timeoutMs) {
				throw new RuntimeException("Timeout waiting for playlist");
			}

			try {
				Thread.sleep(2000);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
				throw new RuntimeException("Interrupted while waiting for playlist", e);
			}
		}

		String urlPath = "/torrents/" + hash + "/hls/playlist.m3u8";
		return "http://localhost:8080" + urlPath;
	}

	public String isDownloadStarted(String magnet) {
		String hash = extractInfoHash(magnet);
		Path downloadDir = Paths.get(System.getProperty("user.dir"),"torrents", hash);

		if (Files.exists(downloadDir)) {
			return hash;
		}
		return null;
	}

	private String extractInfoHash(String magnetUri) {
		Pattern pattern = Pattern.compile("xt=urn:btih:([A-Z0-9]+)");
		Matcher matcher = pattern.matcher(magnetUri);
		if (matcher.find()) {
			return matcher.group(1);
		}
		throw new IllegalArgumentException("Magnet link does not contain a valid info hash.");
	}

}
