package com.hypertube.core_api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TorrentModel {

	@JsonProperty("Name")
	private String name;

	@JsonProperty("Size")
	private String size;

	@JsonProperty("Category")
	private String category;

	@JsonProperty("Seeders")
	private String seeders;

	@JsonProperty("Leechers")
	private String leechers;

	@JsonProperty("Url")
	private String url;

	@JsonProperty("Magnet")
	private String magnet;

	private String hash;

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		category = category;
	}

	public String getLeechers() {
		return leechers;
	}

	public void setLeechers(String leechers) {
		this.leechers = leechers;
	}

	public String getMagnet() {
		return magnet;
	}

	public void setMagnet(String magnet) {
		this.magnet = magnet;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getSeeders() {
		return seeders;
	}

	public void setSeeders(String seeders) {
		this.seeders = seeders;
	}

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getHash() {
		return hash;
	}

	public void setHash(String hash) {
		this.hash = hash;
	}
}
