package com.hypertube.core_api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.model.TranslateModel;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TranslateService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public TranslateService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public ResponseEntity<Map<String, Object>> translate(TranslateModel translateModel) throws JsonProcessingException {
        List<String> translatedResult = new ArrayList<>();

        for (String text : translateModel.getText()) {
            String url = "http://localhost:5000/translate";
            // String url = "http://localhost:5000/translate";
            String requestJson = "{"
                    + "\"q\": \"" + text + "\","
                    + "\"source\": \"" + translateModel.getSource() + "\","
                    + "\"target\": \"" + translateModel.getTarget() + "\","
                    + "\"format\": \"text\""
                    + "}";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode node = objectMapper.readTree(response.getBody());
                translatedResult.add(node.get("translatedText").asText());
            } else {
                translatedResult.add("Error translating text");
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("translations", translatedResult);

        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
