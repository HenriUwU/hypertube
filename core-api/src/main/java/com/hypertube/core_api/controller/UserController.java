package com.hypertube.core_api.controller;

import com.hypertube.core_api.model.UserEntity;
import com.hypertube.core_api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping(path = "/{id}")
    public ResponseEntity<UserEntity> getUser(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PutMapping()
    public UserEntity updateUser(@RequestBody UserEntity user) {
        return userService.updateUser(user);
    }

}
