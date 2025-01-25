package com.hypertube.core_api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.model.UserEntity;
import com.hypertube.core_api.repository.UserRepository;
import com.hypertube.core_api.security.JwtTokenUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final RestTemplate restTemplate;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.restTemplate = new RestTemplate();
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
        if (user.getUsername() == null || user.getUsername().isEmpty()) {
            throw new UsernameNotFoundException("Username is empty");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new UsernameNotFoundException("Password is empty");
        }
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new UsernameNotFoundException("Email is empty");
        }

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

    public ResponseEntity<String> omniauth(String code, String url) throws Exception {
        Map<String, Object> map = new HashMap<>();
        map.put("grant_type", "authorization_code");
        map.put("client_id", "u-s4t2ud-3d0b78d85d1720e444f1354145f582882a28378ec38a8c07fedc6bad0323ad89");
        map.put("client_secret", "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");
        map.put("code", code);
        map.put("redirect_uri", "http://localhost:4200/auth/omniauth");

        ResponseEntity<String> response = restTemplate.postForEntity(url, map, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(response.getBody());

        return new ResponseEntity<>(generateJwtFromOauth(node.get("access_token").asText()), response.getStatusCode());
    }

    private String generateJwtFromOauth(String token) {
        RestClient restClient = RestClient.create();

        String response = restClient.get()
                .uri("https://api.intra.42.fr/v2/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        return null;
    }

}
