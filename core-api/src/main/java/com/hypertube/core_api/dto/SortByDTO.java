package com.hypertube.core_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class SortByDTO {
	private SortBy sortBy;
	private List<Integer> genresIds;
	private Integer page;

	public List<Integer> getGenresIds() {
		return genresIds;
	}

	public void setGenresIds(List<Integer> genres_ids) {
		this.genresIds = genres_ids;
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
