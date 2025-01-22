package com.hypertube.core_api.controller;

import com.hypertube.core_api.dto.VideoDTO;
import com.hypertube.core_api.service.VideoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping(path = "/movies")
    public List<VideoDTO> getVideos() {
        return this.videoService.getVideos();
    }

    @GetMapping(path = "/movies/{id}")
    public VideoDTO getVideo(@PathVariable Long id) {
        return this.videoService.getVideo(id);
    }

    @PostMapping(path = "/movies")
    public VideoDTO createVideo(@RequestBody VideoDTO videoDTO) {
        return this.videoService.createVideo(videoDTO);
    }

}
