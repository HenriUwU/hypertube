package com.hypertube.core_api.service;

import bt.Bt;
import bt.data.file.FileSystemStorage;
import bt.runtime.BtClient;
import com.hypertube.core_api.model.TorrentModel;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TorrentService {

	private final RestTemplate restTemplate;

	public TorrentService() {
		this.restTemplate = new RestTemplate();
	}

	public List<TorrentModel> searchTorrent(String searchTerm) {
		ResponseEntity<List<TorrentModel>> responseEntity = restTemplate.exchange(
				"http://localhost:3001/api/piratebay/" + searchTerm,
				HttpMethod.GET,
				HttpEntity.EMPTY,
				new ParameterizedTypeReference<List<TorrentModel>>() {}
		);
		return responseEntity.getBody();
	}

	public String start(TorrentModel torrentModel) {
		try {
			String infoHash = extractInfoHash(torrentModel.getMagnet());
			Path downloadDir = Paths.get(System.getProperty("user.dir"), "movies", infoHash);

			if (!Files.exists(downloadDir)) {
				Files.createDirectories(downloadDir);
			}

			BtClient client = Bt.client()
					.magnet(torrentModel.getMagnet())
					.storage(new FileSystemStorage(downloadDir))
					.autoLoadModules()
					.stopWhenDownloaded()
					.build();

			client.startAsync(state -> {
				System.out.println("Progress: " + (state.getPiecesComplete() * 100 / state.getPiecesTotal()) + "%");
			}, 1000);

			return infoHash;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public void stream(String hash) {

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
