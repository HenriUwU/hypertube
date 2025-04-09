package com.hypertube.core_api.dto;
import lombok.Data;
import java.util.List;

@Data
public class SearchDTO {
    private String query;
    private List<Integer> genres_ids;
    private Integer page;
}
