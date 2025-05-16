package com.hypertube.core_api.model;

import lombok.Data;

import java.util.List;

@Data
public class SortByModel {
	private SortBy sortBy;
	private List<Integer> genresIds;
	private Integer page;
	private Integer minStars;

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

	public Integer getMinStars() {
		return minStars;
	}

	public void setMinStars(Integer minStars) {
		this.minStars = minStars;
	}
}
