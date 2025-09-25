package com.hypertube.core_api.model;

import lombok.Data;

import java.util.List;

@Data
public class SortByModel {
	private String sortBy;
	private List<Integer> genresIds;
	private Integer page;
	private Integer minStars;
	private String productionYear;

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

	public String getSortBy() {
		return sortBy;
	}

	public void setSortBy(String sortBy) {
		this.sortBy = sortBy;
	}

	public Integer getMinStars() {
		return minStars;
	}

	public void setMinStars(Integer minStars) {
		this.minStars = minStars;
	}

	public String getProductionYear() {
		return productionYear;
	}

	public void setProductionYear(String productionYear) {
		this.productionYear = productionYear;
	}
}
