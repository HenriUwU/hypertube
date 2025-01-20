package com.hypertube.core_api.dto;

import lombok.Data;

@Data
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String preferredLanguage;
    private byte[] avatar;

}
