package com.hypertube.core_api.controller;

import com.hypertube.core_api.entity.UserEntity;
import com.hypertube.core_api.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(path = "/register")
    public void register (@RequestBody UserEntity user) {
        userService.register(user);
    }

    @PostMapping(path = "/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody UserEntity user) {
        return userService.login(user);
    }

    @PostMapping(path = "/omniauth/42")
    public ResponseEntity<Map<String, String>> omniauth(@RequestBody String code) throws Exception {
        return userService.omniauthFortyTwo(code);
    }

    @PostMapping(path = "/omniauth/discord")
    public ResponseEntity<Map<String, String>> omniauthDiscord(@RequestBody String code) throws Exception {
        return userService.omniauthDiscord(code);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        return this.userService.verifyEmail(token);
    }

    @GetMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        return this.userService.forgotPassword(email);
    }

    @GetMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token) {
        return this.userService.resetPassword(token);
    }

    @PostMapping("/old-password-verify")
    public ResponseEntity<String> oldPasswordVerify(@RequestBody String oldPassword, @RequestHeader("Authorization") String token) {
        return this.userService.oldPasswordVerify(oldPassword, token);
    }

    @PostMapping("/update-password")
    public ResponseEntity<String> updatePassword(
            @RequestBody String password,
            @RequestHeader(value = "Authorization", required = false) String headerToken,
            @RequestParam(value = "token", required = false) String queryToken) {

        String token = (headerToken != null && !headerToken.isEmpty())
                ? headerToken
                : queryToken;
        if (headerToken != null && !headerToken.isEmpty())
            return this.userService.updatePasswordAuth(password, token);
        else if (queryToken != null && !queryToken.isEmpty())
            return this.userService.updatePasswordNoAuth(password, token);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing token");

    }

}
