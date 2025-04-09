package com.hypertube.core_api.controller;

import com.hypertube.core_api.dto.CommentDTO;
import com.hypertube.core_api.dto.CommentLikesDTO;
import com.hypertube.core_api.service.CommentService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/comment")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping()
    public CommentDTO addComment(@RequestBody CommentDTO comment) {
        return this.commentService.postComment(comment);
    }

    @PutMapping()
    public CommentDTO updateComment(@RequestBody CommentDTO comment) {
        return this.commentService.updateComment(comment);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable Integer commentId) {
        this.commentService.deleteComment(commentId);
    }

    @PostMapping("/like")
    public CommentDTO likeComment(@RequestBody CommentLikesDTO commentLike) {
        return this.commentService.likeComment(commentLike);
    }

    @DeleteMapping("/unlike")
    public CommentDTO unlikeComment(@RequestBody CommentLikesDTO commentUnlike) {
        return this.commentService.unlikeComment(commentUnlike);
    }
}
