package com.hypertube.core_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class UserEntity {

	@Id
	private Long id;

	@Column
	private String username;

	@Column
	private String email;

	@Column
	private String password;

	@Column
	private String firstName;

	@Column
	private String lastName;

	@Column
	private String preferredLanguage;

}
