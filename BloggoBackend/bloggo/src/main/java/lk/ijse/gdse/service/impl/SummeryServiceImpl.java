package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.service.SummeryService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SummeryServiceImpl implements SummeryService {

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
