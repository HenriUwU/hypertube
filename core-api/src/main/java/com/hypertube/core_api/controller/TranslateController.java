package com.hypertube.core_api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hypertube.core_api.model.LanguageModel;
import com.hypertube.core_api.model.TranslateModel;
import com.hypertube.core_api.service.TranslateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/translate")
public class TranslateController {

    private final TranslateService translateService;

    public TranslateController(TranslateService translateService) {
        this.translateService = translateService;
    }

    @PostMapping()
    public ResponseEntity<Map<String, Object>> translate(@RequestBody TranslateModel translateModel) throws JsonProcessingException {
        return translateService.translate(translateModel);
    }

    @GetMapping("/lang")
    public ResponseEntity<List<LanguageModel>> getAvailableLang() {
        return translateService.getAvailableLang();
    }
}
