package com.hypertube.core_api.dto;

import java.util.List;

public class SearchDTO {
    private String query;
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

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

}
