package com.hypertube.core_api.controller;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.dto.CommentLikesDTO;
import com.hypertube.core_api.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/comment")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping()
    public CommentDTO addComment(@RequestBody CommentDTO comment, @RequestHeader("Authorization") String token) {
        return this.commentService.postComment(comment, token);
    }

    @PutMapping()
    public CommentDTO updateComment(@RequestBody CommentDTO comment) {
        return this.commentService.updateComment(comment);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable Integer commentId, @RequestHeader("Authorization") String token) {
        this.commentService.deleteComment(commentId, token);
    }

    @PostMapping("/like/{commentId}")
    public CommentDTO likeComment(@PathVariable Integer commentId, @RequestHeader("Authorization") String token) {
        return this.commentService.likeComment(commentId, token);
    }

    @DeleteMapping("/unlike/{commentId}")
    public CommentDTO unlikeComment(@PathVariable Integer commentId, @RequestHeader("Authorization") String token) {
        return this.commentService.unlikeComment(commentId, token);
    }
}
