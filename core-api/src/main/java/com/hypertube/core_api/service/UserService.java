package com.hypertube.core_api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.model.UserEntity;
import com.hypertube.core_api.repository.UserRepository;
import com.hypertube.core_api.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    @Value("${discord.client.id}")
    private String discordClientId;
    @Value("${discord.client.secret}")
    private String discordClientSecret;

    @Value("${42.client.id}")
    private String fortyTwoClientId;
    @Value("${42.client.secret}")
    private String fortyTwoClientSecret;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
        this.restClient = RestClient.create();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .build();
    }

    public void register(UserEntity user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public ResponseEntity<Map<String, String>> login(UserEntity user) {
        UserEntity dbUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException(user.getUsername()));

        if (passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {
            String token = jwtTokenUtil.generateToken(user.getUsername());

            Map<String, String> map = new HashMap<>();
            map.put("token", token);
            return ResponseEntity.ok(map);
        } else {
            throw new RuntimeException("Wrong password");
        }
    }

    public ResponseEntity<Map<String, String>> omniauthDiscord(String code) throws Exception {
        HttpEntity<MultiValueMap<String, String>> request = getMultiValueMapHttpEntity(code);

        ResponseEntity<String> response = restTemplate.exchange(
                "https://discord.com/api/oauth2/token",
                HttpMethod.POST,
                request,
                String.class
        );
        JsonNode node = objectMapper.readTree(response.getBody());
        Map<String, String> jwt = new HashMap<>();
        jwt.put("token", generateJwtFromDiscord(node.get("access_token").asText()));

        return ResponseEntity.ok(jwt);
    }

    public ResponseEntity<Map<String, String>> omniauth42(String code) throws Exception {
        Map<String, Object> map = new HashMap<>();
        map.put("grant_type", "authorization_code");
        map.put("client_id", fortyTwoClientId);
        map.put("client_secret", fortyTwoClientSecret);
        map.put("code", code);
        map.put("redirect_uri", "http://localhost:4200/auth/omniauth/42");

        ResponseEntity<String> response = restTemplate.postForEntity("https://api.intra.42.fr/oauth/token", map, String.class);
        JsonNode node = objectMapper.readTree(response.getBody());
        Map<String, String> jwt = new HashMap<>();
        jwt.put("token", generateJwtFrom42(node.get("access_token").asText()));

        return ResponseEntity.ok(jwt);
    }

    private String generateJwtFromDiscord(String token) {
        String response = restClient.get()
                .uri("https://discord.com/api/users/@me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            String eidDiscord = jsonNode.get("id").asText();

            Optional<UserEntity> optUser = userRepository.findByEidDiscord(eidDiscord);
            if (optUser.isPresent()) {
                return jwtTokenUtil.generateToken(optUser.get().getUsername());
            }

            UserEntity user = new UserEntity();
            String username = jsonNode.get("username").asText();
            String email = jsonNode.get("email").asText();
            String firstName = jsonNode.get("global_name").asText();
            String lastName = jsonNode.get("global_name").asText();

            user.setUsername(username);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPassword(token);
            user.setEidDiscord(eidDiscord);
            register(user);

            return jwtTokenUtil.generateToken(eidDiscord);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String generateJwtFrom42(String token) {
        String response = restClient.get()
                .uri("https://api.intra.42.fr/v2/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            String eid42 = jsonNode.get("id").asText();

            Optional<UserEntity> optUser = userRepository.findByEid42(eid42);
            if (optUser.isPresent()) {
                return jwtTokenUtil.generateToken(optUser.get().getUsername());
            }

            UserEntity user = new UserEntity();
            String username = jsonNode.get("login").asText();
            String email = jsonNode.get("email").asText();
            String firstName = jsonNode.get("first_name").asText();
            String lastName = jsonNode.get("last_name").asText();

            user.setUsername(username);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPassword(token);
            user.setEid42(eid42);
            register(user);

            return jwtTokenUtil.generateToken(user.getUsername());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private HttpEntity<MultiValueMap<String, String>> getMultiValueMapHttpEntity(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(discordClientId, discordClientSecret);
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", "http://localhost:4200/auth/omniauth/discord");

        return new HttpEntity<>(body, headers);
    }

}
