package com.hypertube.core_api.controller;

import com.hypertube.core_api.dto.CommentDTO;
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

}
