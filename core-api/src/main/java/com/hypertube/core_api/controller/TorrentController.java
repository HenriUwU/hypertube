package com.hypertube.core_api.controller;

import com.hypertube.core_api.model.TorrentModel;
import com.hypertube.core_api.service.TorrentService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
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

	@PostMapping(path = "/start")
	public String startTorrent(@RequestBody TorrentModel torrentModel) {
		return torrentService.start(torrentModel);
	}

	@GetMapping(path = "/stream/{hash}")
	public String streamTorrent(@PathVariable String hash) {
		return torrentService.stream(hash);
	}


}
