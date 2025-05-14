from flask import Flask, request, jsonify
from pathlib import Path
import os
import subprocess
import threading

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
			"-analyzeduration", "100M",
			"-probesize", "100M",
			"-i", str(input_path),
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
			str(output_file)
		]

		subprocess.run(command, check=True)
		print(f"HLS transcoding complete: {output_file}")
	
	except subprocess.CalledProcessError as e:
		print(f"FFmpeg error: {e}")
	except FileNotFoundError as e:
		print(f"File error: {e}")
		
import subprocess

def check_ffmpeg(input_path):
	command = [
		"ffprobe",
		"-v", "error",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1:nokey=1",
		str(input_path)
	]
	try:
		result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
		duration = result.stdout.decode().strip()
		return duration != ""
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