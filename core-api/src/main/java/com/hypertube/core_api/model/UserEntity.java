package com.hypertube.core_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
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
	@Lob
	private byte[] avatar;

	@Column
	private String preferredLanguage;

}
