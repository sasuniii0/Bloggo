package lk.ijse.gdse.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lk.ijse.gdse.dto.SummeryRequestDTO;
import lk.ijse.gdse.dto.SummeryResponseDTO;
import lk.ijse.gdse.service.SummeryService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SummeryServiceImpl implements SummeryService {

    private final String HF_API_URL = "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6";
    private final String HF_API_KEY = "";

    private final RestTemplate restTemplate;

    @Override
    public SummeryResponseDTO summarize(SummeryRequestDTO request) {
        try {
            if (request.getText() == null || request.getText().isBlank()) {
                return new SummeryResponseDTO(" Content is empty, cannot summarize.");
            }

            // Build request payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("inputs", request.getText());
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("min_length", 30);
            parameters.put("max_length", 150);
            payload.put("parameters", parameters);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.set("Authorization", "Bearer " + HF_API_KEY);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            // Send POST request
            String response = restTemplate.postForObject(HF_API_URL, entity, String.class);

            // Parse response JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            // Extract summary
            String summary = root.get(0).get("summary_text").asText();

            return new SummeryResponseDTO(summary);

        } catch (Exception e) {
            e.printStackTrace();
            return new SummeryResponseDTO(" Failed to summarize the content");
        }
    }

    /*private final ChatClient chatClient; // Spring AI automatically configures this

    @Override
    public String generateSummary(String text) {

        ChatCompletion completion = ChatCompletion.builder()
                .model("gpt-3.5-turbo")
                .messages(List.of(
                        ChatMessage.ofSystem("You are a helpful assistant that summarizes text."),
                        ChatMessage.ofUser("Summarize the following text briefly:\n" + text)
                ))
                .maxTokens(150)
                .build();

        return chatClient.chat(completion)
                .block() // Block to get synchronous response
                .getChoices()
                .get(0)
                .getMessage()
                .getContent();
    }*/
}
