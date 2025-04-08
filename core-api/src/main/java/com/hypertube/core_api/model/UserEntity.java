package com.hypertube.core_api.model;

import jakarta.persistence.*;

import java.sql.Blob;

@Entity
@Table(name = "users")
public class UserEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false, unique = true)
	private String username;

	@Column(nullable = false, unique = true)
	private String email;

	private String password;
	private String firstName;
	private String lastName;
	private String language;
	private String fortyTwoEid;
	private String discordEid;
	@Lob
	private Blob profilePicture;

	public Blob getProfilePicture() {
		return profilePicture;
	}

	public void setProfilePicture(Blob profilePicture) {
		this.profilePicture = profilePicture;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getLanguage() {
		return language;
	}

	public void language(String language) {
		this.language = language;
	}

	public String getFortyTwoEid() {
		return this.fortyTwoEid;
	}

	public void setFortyTwoEid(String fortyTwoEid) {
		this.fortyTwoEid = fortyTwoEid;
	}

	public String getDiscordEid() {
		return this.discordEid;
	}

	public void setDiscordEid(String discordEid) {
		this.discordEid = discordEid;
	}

}
