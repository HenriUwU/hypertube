package com.hypertube.core_api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hypertube.core_api.model.LanguageModel;
import com.hypertube.core_api.model.LibreLangModel;
import com.hypertube.core_api.model.TranslateModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TranslateService {
    private final String translateApiUrl;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    @Value("${tmdb.bearer-token}")
    private String tmdbToken;

    public TranslateService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
        // this.translateApiUrl = "http://locahost:5000/";
        this.translateApiUrl = "http://libretranslate:5000/";
    }

    public ResponseEntity<Map<String, Object>> translate(TranslateModel translateModel) throws JsonProcessingException {
        List<String> translatedResult = new ArrayList<>();
        Map<String, Object> result = new HashMap<>();

        for (String text : translateModel.getText()) {
            String url = this.translateApiUrl + "/translate";
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

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode node = objectMapper.readTree(response.getBody());
                translatedResult.add(node.get("translatedText").asText());
            }
        }
        result.put("translations", translatedResult);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    public ResponseEntity<List<LanguageModel>> getAvailableLang() {
        List<LanguageModel> languageList = new ArrayList<>();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + this.tmdbToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<List<LanguageModel>> response = restTemplate.exchange(
                "https://api.themoviedb.org/3/configuration/languages",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        ResponseEntity<List<LibreLangModel>> responseLanguages = restTemplate.exchange(
                this.translateApiUrl + "/languages",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                }
        );

        Set<String> supportedCodes = responseLanguages.getBody()
                .stream()
                .map(LibreLangModel::getCode)
                .collect(Collectors.toSet());

        if (response.getBody() != null) {
            for (LanguageModel languageModel : response.getBody()) {
                String code = languageModel.getIso_639_1();
                if (supportedCodes.contains(code)) {
                    languageModel.setFlag("https://flagcdn.com/w80/" + code + ".png");
                    languageList.add(languageModel);
                }
            }
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(languageList, HttpStatus.OK);
    }
}
