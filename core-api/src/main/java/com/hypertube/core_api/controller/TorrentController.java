package com.hypertube.core_api.controller;

import com.hypertube.core_api.model.TorrentModel;
import com.hypertube.core_api.service.TorrentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

	@PostMapping(path = "/start")
	public String startTorrent(@RequestBody TorrentModel torrentModel) {
		return torrentService.start(torrentModel);
	}

	@GetMapping(path = "/stream/{hash}")
	public void streamTorrent(@PathVariable String hash,
	                          @RequestHeader(value = "range", required = false) String range,
							  HttpServletRequest request,
	                          HttpServletResponse response) {

	}

}
