package com.hypertube.core_api.service;

import bt.Bt;
import bt.data.file.FileSystemStorage;
import bt.runtime.BtClient;
import com.hypertube.core_api.model.TorrentModel;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

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
			Path downloadDir = Paths.get(System.getProperty("user.dir"),"torrents", infoHash);

			if (Files.exists(downloadDir)) {
				throw new RuntimeException("Movie already exists");
			}
			if (!Files.exists(downloadDir)) {
				Files.createDirectories(downloadDir);
			}

			BtClient client = Bt.client()
					.magnet(torrentModel.getMagnet())
					.storage(new FileSystemStorage(downloadDir))
					.autoLoadModules()
					.stopWhenDownloaded()
					.build();

			AtomicBoolean hlsStarted = new AtomicBoolean(false);
			AtomicLong lastAttempt = new AtomicLong(0);

			client.startAsync(state -> {
				int progress = state.getPiecesComplete() * 100 / state.getPiecesTotal();
				System.out.println("Download Progress: " + progress + "%");

				if (progress > 10 && !hlsStarted.get()) {
					long now = System.currentTimeMillis();
					if (now - lastAttempt.get() > 10_000) {
						lastAttempt.set(now);

						try {
							if (generateHlsStream(findVideoFile(downloadDir), downloadDir.resolve("hls"))) {
								hlsStarted.set(true);
								System.out.println("[HLS] File ready, generating HLS");
							} else {
								System.out.println("[HLS] File not ready, retry in 10s");
							}
						} catch (IOException e) {
							throw new RuntimeException(e);
						}
					}
				}
			}, 1000);

			return infoHash;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public void stream(String hash, HttpServletResponse response) throws IOException {
		Path playlistPath = Paths.get(System.getProperty("user.dir"),"torrents", hash, "hls", "playlist.m3u8");

		if (!Files.exists(playlistPath)) {
			response.sendError(HttpServletResponse.SC_NOT_FOUND, "HLS playlist not ready yet");
			return;
		}

		response.setContentType("application/vnd.apple.mpegurl");
		Files.copy(playlistPath, response.getOutputStream());
	}

	private String extractInfoHash(String magnetUri) {
		Pattern pattern = Pattern.compile("xt=urn:btih:([A-Z0-9]+)");
		Matcher matcher = pattern.matcher(magnetUri);
		if (matcher.find()) {
			return matcher.group(1);
		}
		throw new IllegalArgumentException("Magnet link does not contain a valid info hash.");
	}

	private Path findVideoFile(Path baseDir) throws IOException {
		try (Stream<Path> paths = Files.walk(baseDir)) {
			return paths
					.filter(Files::isRegularFile)
					.filter(p -> {
						String name = p.getFileName().toString().toLowerCase();
						return name.endsWith(".mp4") || name.endsWith(".mkv") || name.endsWith(".avi");
					})
					.findFirst()
					.orElseThrow(() -> new FileNotFoundException("No video file found in " + baseDir));
		}
	}

	public Boolean generateHlsStream(Path videoFile, Path hlsOutputDir) {
		try {
			if (!Files.exists(hlsOutputDir)) {
				Files.createDirectories(hlsOutputDir);
			}

			Process process = getProcess(videoFile, hlsOutputDir);

			new Thread(() -> {
				try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
					String line;
					while ((line = reader.readLine()) != null) {
						System.out.println("[FFMPEG] " + line);
					}
				} catch (IOException e) {
					throw new RuntimeException(e);
				}
			}).start();

			int exitCode = process.waitFor();
			return exitCode == 0;
		} catch (IOException | InterruptedException e) {
			throw new RuntimeException(e);
		}
	}

	private static Process getProcess(Path videoFile, Path hlsOutputDir) throws IOException {
		List<String> command = List.of(
				"ffmpeg",
				"-i", videoFile.toString(),
				"-c:v", "libx264",
				"-preset", "ultrafast",
				"-profile:v", "baseline",
				"-level", "4.1",
				"-crf", "18",
				"-pix_fmt", "yuv420p",
				"-movflags", "+faststart",
				"-c:a", "aac",
				"-b:a", "128k",
				"-ar", "48000",
				"-ac", "2",
				"-start_number", "0",
				"-hls_time", "10",
				"-hls_list_size", "0",
				"-f", "hls",
				hlsOutputDir.resolve("playlist.m3u8").toString()
		);

		ProcessBuilder pb = new ProcessBuilder(command);
		pb.redirectErrorStream(true);
		Process process = pb.start();
		return process;
	}


}
