package com.hypertube.core_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class SortByDTO {
    private SortBy sortBy;
    private List<Integer> genresIds;
    private Integer page;
}
