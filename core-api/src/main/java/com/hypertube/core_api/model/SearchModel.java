package com.hypertube.core_api.model;

import java.util.List;

public class SearchModel {
    private String query;
    private List<Integer> genresIds;
    private Integer page;

    public List<Integer> getGenresIds() {
        return genresIds;
    }

    public void setGenresIds(List<Integer> genresIds) {
        this.genresIds = genresIds;
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
