package com.hypertube.core_api.controller;

import com.hypertube.core_api.model.UserEntity;
import com.hypertube.core_api.service.UserService;
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
    public ResponseEntity<String> omniauth(@RequestBody String code) throws Exception {
        return userService.omniauth(code, "https://api.intra.42.fr/oauth/token");
    }

}
