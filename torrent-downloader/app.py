from flask import Flask, request, jsonify
from torrentp import TorrentDownloader
import os
import threading
import time
import subprocess
import requests
import re
import asyncio

app = Flask(__name__)

BASE_PATH = "/torrents"
HLS_TRANSCODER_BASE_URL = "http://torrent-hls-transcoder:5002"

@app.route("/download", methods=["POST"])
def trigger_download():
	data = request.get_json()
	magnet = data.get("magnet")

	if not magnet:
		return jsonify({"error": "Missing magnet"}), 400
	
	threading.Thread(target=start_download, args=(magnet,)).start()
	return jsonify({"status": "Download started"}), 202

def start_download(magnet):
	torrent_hash = extract_info_hash(magnet)
	movie_dir = os.path.join(BASE_PATH, torrent_hash)
	lock_file = os.path.join(movie_dir, ".lock")

	os.makedirs(movie_dir, exist_ok=True)

	if os.path.exists(lock_file):
		print("Already downloaded this torrent.")
		return

	open(lock_file, "w").close()
	
	downloader = TorrentDownloader(magnet, movie_dir)

	threading.Thread(target=notify_transcoder, args=(torrent_hash,)).start()
	asyncio.run(downloader.start_download())

def notify_transcoder(torrent_hash):
	started = False

	while not started:
		time.sleep(10)
		try:
			response = requests.get(HLS_TRANSCODER_BASE_URL + "/can_transcode", params={"torrent_hash": torrent_hash})
			if response.status_code == 200:
				data = response.json()
				if data.get("can_transcode"):
					requests.post(HLS_TRANSCODER_BASE_URL + "/transcode", json={"torrent_hash": torrent_hash})
					started = True
		except Exception as e:
			print(f"Polling error: {e}")

def extract_info_hash(magnet_uri):
	pattern = r"xt=urn:btih:([a-zA-Z0-9]{32,})"
	match = re.search(pattern, magnet_uri, re.IGNORECASE)
	if match:
		return match.group(1).upper()
	else:
		raise ValueError("Magnet link does not contain a valid info hash.")

if __name__ == "__main__":
	os.makedirs(BASE_PATH, exist_ok=True)
	app.run(host="0.0.0.0", port=5001)