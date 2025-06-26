package com.hypertube.core_api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.hypertube.core_api.dto.UserDTO;
import com.hypertube.core_api.entity.TokenEntity;
import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.mapper.UserMapper;
import com.hypertube.core_api.model.TokenType;
import com.hypertube.core_api.repository.TokenRepository;
import com.hypertube.core_api.repository.UserRepository;
import com.hypertube.core_api.security.JwtTokenUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
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

import javax.sql.rowset.serial.SerialBlob;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.sql.Blob;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

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

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String googleRedirectUri;

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

    @Transactional
    public UserDTO getUserByToken(String token) {
        String username = jwtTokenUtil.extractUsername(token.substring(7));
        return userMapper.map(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));
    }

    @Transactional
    public UserDTO getUser(Integer id) {
        if (id == null) return null;
        return userMapper.map(userRepository.findById(id).orElse(null));
    }

    @Transactional
    public List<UserDTO> getUsers() {
        return userMapper.map((List<UserEntity>) userRepository.findAll());
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

    @Transactional
    public UserDTO updateUser(UserDTO user) {
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

        UserDTO updatedUser = userMapper.map(userRepository.save(existingUser));
        updatedUser.setToken(jwtTokenUtil.generateToken(user.getUsername()));
        return updatedUser;
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
            user.setEmailVerify(true);
            userRepository.save(user);

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
            String picture = jsonNode.get("image").get("link").asText();

            user.setUsername(username);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPassword(token);
            user.setFortyTwoEid(eid42);
            user.setEmailVerify(true);
            saveImageFromInternetLink(picture, user);
            userRepository.save(user);

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
        String resetUrl = "http://localhost:4200/auth/forgot-password?token=" + resetToken;

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

    public ResponseEntity<Map<String, String>> resetPassword(String token) {
        TokenEntity tokenEntity = tokenRepository.findByToken(token);
        if (tokenEntity == null || tokenEntity.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new EntityNotFoundException("No account with this token or expired token");
        Map<String, String> map = new HashMap<>();
        map.put("response", "Password can be reset");
        return ResponseEntity.ok(map);
    }

    public ResponseEntity<Map<String, String>> oldPasswordVerify(String oldPassword, String token) {
        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();

        Map<String, String> map = new HashMap<>();
        if (passwordEncoder.matches(oldPassword, userEntity.getPassword()))
            map.put("response", "true");
        else
            map.put("response", "false");
        return ResponseEntity.ok(map);
    }

    public ResponseEntity<Map<String, String>> updatePasswordAuth(String newPassword, String token) {
        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();
        userEntity.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(userEntity);
        Map<String, String> map = new HashMap<>();
        map.put("response", "Password changed");
        return ResponseEntity.ok(map);
    }

    public ResponseEntity<Map<String, String>> updatePasswordNoAuth(String newPassword, String token) {
        TokenEntity tokenEntity = tokenRepository.findByToken(token);
        if (tokenEntity == null || tokenEntity.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new EntityNotFoundException("No account with this token or expired token");

        UserEntity userEntity = tokenEntity.getUser();
        userEntity.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(userEntity);
        tokenRepository.delete(tokenEntity);
        Map<String, String> map = new HashMap<>();
        map.put("response", "Password changed");
        return ResponseEntity.ok(map);
    }

    public ResponseEntity<Map<String, String>> omniauthGoogle(String code) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        params.add("redirect_uri", googleRedirectUri);
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(params, headers);

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
                "https://oauth2.googleapis.com/token",
                tokenRequest,
                Map.class
        );

        String idTokenString = (String) tokenResponse.getBody().get("id_token");
        if (idTokenString == null)
            throw new RuntimeException("id_token is missing from the token response.");

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null)
            throw new RuntimeException("Invalid ID token.");

        GoogleIdToken.Payload payload = idToken.getPayload();

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");
        String googleEid = payload.getSubject();

        Map<String, String> response = new HashMap<>();
        Optional<UserEntity> optUser = userRepository.findByGoogleEid(googleEid);
        if (optUser.isPresent()) {
            response.put("id", optUser.get().getId().toString());
            response.put("token", jwtTokenUtil.generateToken(optUser.get().getUsername()));
            return ResponseEntity.ok(response);
        }

        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(email);
        userEntity.setUsername(name);
        userEntity.setPassword(passwordEncoder.encode(googleEid));
        userEntity.setGoogleEid(googleEid);
        userEntity.setEmailVerify(true);
        saveImageFromInternetLink(picture, userEntity);
        userRepository.save(userEntity);

        response.put("id", userEntity.getId().toString());
        response.put("token", jwtTokenUtil.generateToken(name));
        return ResponseEntity.ok(response);
    }

    private void saveImageFromInternetLink(String picture, UserEntity userEntity) {
        try {
            URL url = new URL(picture);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (InputStream is = url.openStream()) {
                byte[] buffer = new byte[8192];
                int n;
                while ((n = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, n);
                }
            }
            byte[] imageBytes = baos.toByteArray();
            Blob profilePictureBlob = new SerialBlob(imageBytes);
            userEntity.setProfilePicture(profilePictureBlob);
        } catch (Exception e) {
        }
    }
    public ResponseEntity<Map<String, String>> omniauth(String token) {
        UserEntity userEntity = userRepository.findByUsername(jwtTokenUtil.extractUsername(token.substring(7))).orElseThrow();

        Map<String, String> map = new HashMap<>();
        if (userEntity.getDiscordEid() == null && userEntity.getGoogleEid() == null && userEntity.getFortyTwoEid() == null)
            map.put("response", "false");
        else
            map.put("response", "true");
        return ResponseEntity.ok(map);
    }
}

