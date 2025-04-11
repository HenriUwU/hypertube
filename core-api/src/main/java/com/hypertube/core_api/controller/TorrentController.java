package com.hypertube.core_api.controller;

import com.hypertube.core_api.model.TorrentModel;
import com.hypertube.core_api.service.TorrentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/torrent")
public class TorrentController {

	private final TorrentService torrentService;

	public TorrentController(TorrentService torrentService) {
		this.torrentService = torrentService;
	}

	@GetMapping(path = "/search")
	public List<TorrentModel> searchTorrent(@RequestParam(name = "query", required = false) String query) {
		return torrentService.searchTorrent(query);
	}

//	@PostMapping(path = "/start")
//	public ResponseEntity<TorrentModel> startTorrent(@RequestBody TorrentModel torrentModel) {
//		return torrentService.start
//	}

}
