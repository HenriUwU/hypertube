package com.hypertube.core_api.model;

import java.util.List;

public class GenresResponse {
    private List<GenreModel> genres;

    public List<GenreModel> getGenres() {
        return genres;
    }

    public void setGenres(List<GenreModel> genres) {
        this.genres = genres;
    }
}
