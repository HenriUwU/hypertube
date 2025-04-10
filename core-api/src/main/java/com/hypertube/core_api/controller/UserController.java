package com.hypertube.core_api.controller;

import com.hypertube.core_api.dto.UserDTO;
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
    public ResponseEntity<UserDTO> getUser(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PutMapping()
    public UserDTO updateUser(@RequestBody UserDTO user) {
        return userService.updateUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Integer id, @RequestHeader("Authorization") String token) {
        this.userService.deleteUser(id, token);
    }

}
