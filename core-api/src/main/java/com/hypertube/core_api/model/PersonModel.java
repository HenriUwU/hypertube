package com.hypertube.core_api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PersonModel {

    private Integer id;
    private String name;
    private String character;
    private String job;

    @JsonProperty("profile_path")
    private String profilePath;

}
