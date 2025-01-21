package com.hypertube.core_api.service;

import com.hypertube.core_api.dto.VideoDTO;
import com.hypertube.core_api.mapper.VideoMapper;
import com.hypertube.core_api.repository.VideoRepository;
import org.springframework.stereotype.Service;

import java.lang.reflect.InaccessibleObjectException;
import java.util.List;

@Service
public class VideoService {

    private final VideoRepository videoRepository;
    private final VideoMapper videoMapper;

    public VideoService(VideoRepository videoRepository, VideoMapper videoMapper) {
        this.videoRepository = videoRepository;
        this.videoMapper = videoMapper;
    }

    public List<VideoDTO> getVideos() {
        return videoMapper.map(videoRepository.findAll());
    }

    public VideoDTO getVideo(Long videoId) {
        if (!videoRepository.existsById(videoId)) {
            throw new InaccessibleObjectException("Video does not exist");
        }
        return videoMapper.map(videoRepository.findById(videoId).get());
    }

    public VideoDTO createVideo(VideoDTO videoDTO) {
        return videoMapper.map(videoRepository.save(videoMapper.map(videoDTO)));
    }

}
