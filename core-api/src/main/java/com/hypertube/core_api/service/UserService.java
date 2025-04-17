package com.hypertube.core_api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.dto.UserDTO;
import com.hypertube.core_api.entity.TokenEntity;
import com.hypertube.core_api.mapper.UserMapper;
import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.model.TokenType;
import com.hypertube.core_api.repository.TokenRepository;
import com.hypertube.core_api.repository.UserRepository;
import com.hypertube.core_api.security.JwtTokenUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.AccessDeniedException;
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

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private JavaMailSender mailSender;

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
    private final UserMapper userMapper;
    private final TokenRepository tokenRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil, ObjectMapper objectMapper, UserMapper userMapper, TokenRepository tokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userMapper = userMapper;
        this.tokenRepository = tokenRepository;
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

    public UserDTO getUserByToken(String token) {
        String username = jwtTokenUtil.extractUsername(token.substring(7));
        return userMapper.map(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));
    }

    public UserDTO getUser(Integer id) {
        if (id == null) return null;
        return userMapper.map(userRepository.findById(id).orElse(null));
    }

    public void register(UserEntity user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        String token = UUID.randomUUID().toString();
        TokenEntity tokenEntity = new TokenEntity();
        tokenEntity.setToken(token);
        tokenEntity.setUser(user);
        tokenEntity.setExpiryDate(LocalDateTime.now().plusDays(1));
        tokenEntity.setType(TokenType.EMAIL_VERIFICATION);
        tokenRepository.save(tokenEntity);
//        sendVerificationEmail(user.getEmail(), token);
    }

    public ResponseEntity<Map<String, String>> login(UserEntity user) {
        UserEntity dbUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException(user.getUsername()));

//        if (!dbUser.isEmailVerify())
//            throw new RuntimeException("Email verify failed");

        if (passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {
            String token = jwtTokenUtil.generateToken(user.getUsername());

            Map<String, String> map = new HashMap<>();
            map.put("token", token);
            map.put("id", dbUser.getId().toString());
            return ResponseEntity.ok(map);
        } else {
            throw new RuntimeException("Wrong password");
        }
    }

    public UserDTO updateUser(UserDTO user) throws SQLException {
        if (user.getId() == null) {
            throw new RuntimeException("Id can not be null");
        }
        UserEntity existingUser = userRepository.findById(user.getId()).orElseThrow(() -> new EntityNotFoundException("User not found"));

        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setLanguage(user.getLanguage());
        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
            existingUser.setProfilePicture(userMapper.base64ToBlob(user.getProfilePicture()));
        } else {
            existingUser.setProfilePicture(null);
        }

        return userMapper.map(userRepository.save(existingUser));
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
        return ResponseEntity.ok(generateJwtFromDiscord(node.get("access_token").asText()));
    }

    public ResponseEntity<Map<String, String>> omniauthFortyTwo(String code) throws Exception {
        Map<String, Object> map = new HashMap<>();
        map.put("grant_type", "authorization_code");
        map.put("client_id", fortyTwoClientId);
        map.put("client_secret", fortyTwoClientSecret);
        map.put("code", code);
        map.put("redirect_uri", "http://localhost:4200/auth/omniauth/42");

        ResponseEntity<String> response = restTemplate.postForEntity("https://api.intra.42.fr/oauth/token", map, String.class);
        JsonNode node = objectMapper.readTree(response.getBody());
        return ResponseEntity.ok(generateJwtFromFortyTwo(node.get("access_token").asText()));
    }

    private Map<String, String> generateJwtFromDiscord(String token) {
        String response = restClient.get()
                .uri("https://discord.com/api/users/@me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            String eidDiscord = jsonNode.get("id").asText();
            Map<String, String> jwt = new HashMap<>();

            Optional<UserEntity> optUser = userRepository.findByDiscordEid(eidDiscord);
            if (optUser.isPresent()) {
                jwt.put("id", optUser.get().getId().toString());
                jwt.put("token", jwtTokenUtil.generateToken(optUser.get().getUsername()));
                return jwt;
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
            user.setDiscordEid(eidDiscord);
            register(user);

            jwt.put("id", user.getId().toString());
            jwt.put("token", jwtTokenUtil.generateToken(username));

            return jwt;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Map<String, String> generateJwtFromFortyTwo(String token) {
        String response = restClient.get()
                .uri("https://api.intra.42.fr/v2/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            String eid42 = jsonNode.get("id").asText();
            Map<String, String> jwt = new HashMap<>();

            Optional<UserEntity> optUser = userRepository.findByFortyTwoEid(eid42);
            if (optUser.isPresent()) {
                jwt.put("id", optUser.get().getId().toString());
                jwt.put("token", jwtTokenUtil.generateToken(optUser.get().getUsername()));
                return jwt;
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
            user.setFortyTwoEid(eid42);
            register(user);

            jwt.put("id", user.getId().toString());
            jwt.put("token", jwtTokenUtil.generateToken(username));

            return jwt;
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

    public void verifyUser(Integer id, String token) {
        UserDTO userDTO = getUserByToken(token);

        if (!id.equals(userDTO.getId())) {
            throw new AccessDeniedException("You are not allowed to do this action");
        }
    }

    public void deleteUser(Integer userId, String token) {
        verifyUser(userId, token);
        userRepository.deleteById(userId);
    }

    public ResponseEntity<String> verifyEmail(String token) {
        TokenEntity tokenEntity = tokenRepository.findByToken(token);
        if (tokenEntity == null || tokenEntity.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }

        UserEntity user = tokenEntity.getUser();
        user.setEmailVerify(true);
        userRepository.save(user);
        tokenRepository.delete(tokenEntity);
        return ResponseEntity.ok("Email verified successfully");
    }

    private void sendVerificationEmail(String toEmail, String verificationToken) {
        String subject = "Vérification de votre adresse email";
        String verificationUrl = "http://localhost:4200/auth/verify-email?token=" + verificationToken;
        String body = "Bonjour,\n\n" +
                "Merci de vous être inscrit. Veuillez cliquer sur le lien suivant pour vérifier votre adresse email :\n" +
                verificationUrl + "\n\n" +
                "Ce lien expirera dans 24 heures.\n\n" +
                "L'équipe Hypertubedigestif";
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("noreply-hypertubedigestif@gmail.com");

        mailSender.send(message);
    }

    public ResponseEntity<String> forgotPassword(String email) {
        UserEntity user = userRepository.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("No account with this email: " + email));
        String token = UUID.randomUUID().toString();
        TokenEntity tokenEntity = new TokenEntity();
        tokenEntity.setToken(token);
        tokenEntity.setUser(user);
        tokenEntity.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        tokenEntity.setType(TokenType.PASSWORD_RESET);
        tokenRepository.save(tokenEntity);

        sendResetPasswordEmail(email, token);
        return ResponseEntity.ok("Si ce compte existe, un email de réinitialisation a été envoyé.");
    }

    private void sendResetPasswordEmail(String toEmail, String resetToken) {
        String subject = "Réinitialisation de votre mot de passe";
        String resetUrl = "http://localhost:4200/auth/reset-password?token=" + resetToken;

        String body = "Bonjour,\n\n" +
                "Vous avez demandé une réinitialisation de votre mot de passe.\n" +
                "Veuillez cliquer sur le lien suivant pour définir un nouveau mot de passe :\n" +
                resetUrl + "\n\n" +
                "Ce lien expirera dans 30 minutes. Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail.\n\n" +
                "L'équipe Hypertubedigestif";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("noreply-hypertubedigestif@gmail.com");
        mailSender.send(message);
    }

    public ResponseEntity<String> resetPassword(String token) {
        TokenEntity tokenEntity = tokenRepository.findByToken(token);
        if (tokenEntity == null || tokenEntity.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
        tokenRepository.delete(tokenEntity);
        return ResponseEntity.ok("Password can be reset");
    }
}
