from flask import Flask, request, jsonify
from pathlib import Path
import os
import subprocess
import threading
import json

app = Flask(__name__)

BASE_PATH = "/torrents"

@app.route("/can_transcode", methods=["GET"])
def can_transcode():
	torrent_hash = request.args.get("torrent_hash")

	if not torrent_hash:
		return jsonify({"error": "Missing torrent hash"}), 400

	try:
		input_path = find_video_file(os.path.join(BASE_PATH, torrent_hash))
		if check_ffmpeg(input_path):
			return jsonify({"can_transcode": True}), 200
		else:
			return jsonify({"can_transcode": False}), 200
	except FileNotFoundError:
		return jsonify({"error": "No video file found"}), 404

@app.route("/transcode", methods=["POST"])
def transcode():
	data = request.get_json()
	torrent_hash = data.get("torrent_hash")

	if not torrent_hash:
		return jsonify({"error": "Missing torrent hash"}), 400
	
	thread = threading.Thread(target=start_transcoding, args=(torrent_hash,))
	thread.start()

	return jsonify({"status": "Transcoding started"}), 202

def start_transcoding(torrent_hash):
	try:
		input_path = find_video_file(os.path.join(BASE_PATH, torrent_hash))
		output_dir = os.path.join(BASE_PATH, torrent_hash, "hls")
		os.makedirs(output_dir, exist_ok=True)
		output_file = os.path.join(output_dir, "playlist.m3u8")

		command = [
			"ffmpeg",
			"-fflags", "+discardcorrupt+fastseek+flush_packets",
			"-err_detect", "ignore_err",
			"-ignore_unknown",
			"-analyzeduration", "100M",
			"-probesize", "100M",
			"-thread_queue_size", "512",
			"-i", str(input_path),
			"-c:v", "libx264",
			"-preset", "fast",
			"-crf", "20",
			"-profile:v", "high",
			"-level", "4.1",
			"-pix_fmt", "yuv420p",
			"-movflags", "+faststart+frag_keyframe+empty_moov",
			"-g", "60",
			"-keyint_min", "30",
			"-sc_threshold", "40",
			"-force_key_frames", "expr:gte(t,n_forced*6)",
			"-c:a", "aac",
			"-b:a", "128k",
			"-ar", "48000",
			"-ac", "2",
			"-avoid_negative_ts", "make_zero",
			"-start_number", "0",
			"-hls_time", "6",
			"-hls_list_size", "0",
			"-hls_flags", "independent_segments+append_list+delete_segments+split_by_time",
			"-hls_delete_threshold", "5",
			"-hls_segment_filename", os.path.join(output_dir, "segment_%05d.ts"),
			"-max_muxing_queue_size", "4096",
			"-threads", "0",
			"-thread_type", "slice+frame",
			"-strict", "experimental",
			"-f", "hls",
			str(output_file)
		]

		# Exécution avec retry en cas d'échec
		max_retries = 3
		for attempt in range(max_retries):
			try:
				print(f"Starting HLS transcoding attempt {attempt + 1}/{max_retries} for {torrent_hash}")
				result = subprocess.run(command, check=True, capture_output=True, text=True)
				print(f"HLS transcoding complete: {output_file}")
				break
			except subprocess.CalledProcessError as e:
				print(f"FFmpeg error on attempt {attempt + 1}: {e}")
				print(f"FFmpeg stderr: {e.stderr}")
				if attempt == max_retries - 1:
					# Dernier essai avec paramètres plus tolérants
					print("Attempting with more tolerant settings...")
					fallback_command = command.copy()
					# Retirer les paramètres problématiques et utiliser des valeurs plus conservatives
					fallback_indices = []
					for i, param in enumerate(fallback_command):
						if param in ["-strict", "-thread_type", "-sc_threshold"]:
							fallback_indices.extend([i, i+1])
					for i in reversed(sorted(set(fallback_indices))):
						fallback_command.pop(i)
					
					try:
						subprocess.run(fallback_command, check=True)
						print(f"HLS transcoding complete with fallback: {output_file}")
						break
					except subprocess.CalledProcessError as fallback_error:
						print(f"Final fallback failed: {fallback_error}")
						raise
	
	except subprocess.CalledProcessError as e:
		print(f"FFmpeg error: {e}")
		print(f"Command that failed: {' '.join(command)}")
	except FileNotFoundError as e:
		print(f"File error: {e}")
	except Exception as e:
		print(f"Unexpected error during transcoding: {e}")

def check_ffmpeg(input_path):
	command = [
		"ffprobe",
		"-v", "error",
		"-select_streams", "v:0",
		"-show_entries", "stream=codec_name,pix_fmt,width,height",
		"-of", "json",
		str(input_path)
	]
	try:
		result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
		data = json.loads(result.stdout)
		streams = data.get("streams", [])

		if not streams:
			return False

		stream = streams[0]
		has_codec = stream.get("codec_name") is not None
		has_pix_fmt = stream.get("pix_fmt") is not None
		has_resolution = stream.get("width") and stream.get("height")

		return has_codec and has_pix_fmt and has_resolution
	except subprocess.CalledProcessError:
		return False

def find_video_file(base_dir):
	video_extensions = [".mp4", ".mkv", ".avi"]

	base_path = Path(base_dir)
	for file_path in base_path.rglob("*"):
		if file_path.is_file() and file_path.suffix.lower() in video_extensions:
			return file_path

	raise FileNotFoundError(f"No video file found in {base_dir}")

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=5002)