package com.hypertube.core_api.model;

public class SubtitleModel {
    private String title;
    private String language;
    private String url;

    public SubtitleModel(String title, String language, String url) {
        this.title = title;
        this.language = language;
        this.url = url;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
