package com.hypertube.core_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class SortByDTO {
	@JsonProperty("sort_by")
	private SortBy sortBy;
	private List<Integer> genres_ids;
	private Integer page;

	public List<Integer> getGenres_ids() {
		return genres_ids;
	}

	public void setGenres_ids(List<Integer> genres_ids) {
		this.genres_ids = genres_ids;
	}

	public Integer getPage() {
		return page;
	}

	public void setPage(Integer page) {
		this.page = page;
	}

	public SortBy getSortBy() {
		return sortBy;
	}

	public void setSortBy(SortBy sortBy) {
		this.sortBy = sortBy;
	}

}
