package com.hypertube.core_api.service;

import bt.Bt;
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

//	public TorrentModel start(TorrentModel torrentModel) {
//		try {
//			Path downloadDir = Paths.get(System.getProperty("user.dir"), "movies");
//			Files.createDirectory(downloadDir);
//
//			BtClient client = Bt.client()
//					.magnet(torrentModel.getMagnet())
//					.autoLoadModules()
//					.stopWhenDownloaded()
//					.build();
//
//		} catch (Exception e) {
//			throw new RuntimeException(e);
//		}
//	}

}
