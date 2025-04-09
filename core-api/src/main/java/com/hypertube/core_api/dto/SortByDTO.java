package com.hypertube.core_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class SortByDTO {
    @JsonProperty("sort_by")
    private SortBy sortBy;
    private List<Integer> genres_ids;
    private Integer page;
}
