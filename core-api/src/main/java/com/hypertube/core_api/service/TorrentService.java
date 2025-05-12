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
import java.time.Duration;
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
//				"http://scraping:3001/api/piratebay/" + searchTerm,
				HttpMethod.GET,
				HttpEntity.EMPTY,
				new ParameterizedTypeReference<List<TorrentModel>>() {}
		);
		return responseEntity.getBody();
	}

	public String startDownload(TorrentModel torrentModel) {
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

			client.startAsync(state -> {
				int progress = state.getPiecesComplete() * 100 / state.getPiecesTotal();
				System.out.println("Download Progresss: " + progress + "%");
			}, 1000);

			startConversion(downloadDir);

			return infoHash;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public void startConversion(Path downloadDir) {
		AtomicBoolean hlsStarted = new AtomicBoolean(false);
		AtomicLong lastAttempt = new AtomicLong(0);

		new Thread(() -> {
			while (!hlsStarted.get()) {
				try {
					Path videoFilePath = findVideoFile(downloadDir);

					if (isVideoFileReady(videoFilePath)) {
						long now = System.currentTimeMillis();
						if (now - lastAttempt.get() > 10_000) {
							lastAttempt.set(now);

							Path hlsDir = downloadDir.resolve("hls");
							try {
								Files.createDirectories(hlsDir);
							} catch (IOException e) {
								System.err.println("Failed to create HLS directory: " + hlsDir);
								return;
							}

							ProcessBuilder processBuilder = getProcess(videoFilePath, downloadDir.resolve("hls"));
							Process process = processBuilder.start();
							hlsStarted.set(true);
							System.out.println("[FFMPEG] CONVERSION STARTED, GENERATING HLS");

							new Thread(() -> {
								try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
									while ((reader.readLine()) != null) {
										System.out.println(reader.readLine());
									}
								} catch (IOException e) {
									throw new RuntimeException(e);
								}
							}).start();

							int exitCode = process.waitFor();
							if (exitCode != 0) {
								hlsStarted.set(false);
								System.out.println("[FFMPEG] CONVERSION FAILED");
							}
						}
					} else {
						System.out.println("[FFMPEG] VIDEO FILE FOUND BUT NOT READY, RETRYING...");
					}
				} catch (FileNotFoundException e) {
					System.out.println("[FFMPEG] NO VIDEO FILE YET, WAITING...");
				} catch (IOException | InterruptedException e) {
					throw new RuntimeException(e);
				}

				try {
					Thread.sleep(5000);
				} catch (InterruptedException ignored) {}
			}
		}).start();
	}

	public String waitForPlaylist(String hash, Duration timeout) {
		Path playlistPath = Paths.get(System.getProperty("user.dir"), "torrents", hash, "hls", "playlist.m3u8");
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

	private static ProcessBuilder getProcess(Path videoFile, Path hlsOutputDir) throws IOException {
		List<String> command = List.of(
				"ffmpeg",
				"-i", videoFile.toString(),
				"-c:v", "libx264",
				"-preset", "fast",
				"-crf", "23",
				"-pix_fmt", "yuv420p",
				"-movflags", "+faststart",
				"-c:a", "aac",
				"-b:a", "128k",
				"-ar", "48000",
				"-ac", "2",
				"-start_number", "0",
				"-hls_time", "12",
				"-hls_list_size", "0",
				"-hls_playlist_type", "event",
				"-force_key_frames", "expr:gte(t,n_forced*12)",
				"-max_muxing_queue_size", "2048",
				"-f", "hls",
				"-hls_flags", "independent_segments+append_list",
				hlsOutputDir.resolve("playlist.m3u8").toString()
		);

		System.out.println("[FFMPEG] " + command);
		ProcessBuilder pb = new ProcessBuilder(command);
		pb.redirectErrorStream(true);
		return pb;
	}

	public boolean isVideoFileReady(Path file) {
		try {
			Process process = new ProcessBuilder(
					"ffprobe",
					"-v", "error",
					"-show_entries", "format=duration",
					"-of", "default=noprint_wrappers=1:nokey=1",
					file.toString()
			).start();

			int code = process.waitFor();
			return code == 0;
		} catch (Exception e) {
			return false;
		}
	}

	public String isDownloadStarted(String magnet) {
		String hash = extractInfoHash(magnet);
		Path downloadDir = Paths.get(System.getProperty("user.dir"),"torrents", hash);

		if (Files.exists(downloadDir)) {
			return hash;
		}
		return null;
	}

}
