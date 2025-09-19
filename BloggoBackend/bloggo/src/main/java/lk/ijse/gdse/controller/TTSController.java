package lk.ijse.gdse.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/tts")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
@RequiredArgsConstructor
public class TTSController {
    private final String VOICERSS_API_KEY = "";
    private final RestTemplate restTemplate;

    @GetMapping(produces = "audio/mpeg")
    public ResponseEntity<byte[]> generateTTS(@RequestParam String text) {
        try {
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String url = "https://api.voicerss.org/?key=" + VOICERSS_API_KEY +
                    "&hl=en-us&c=MP3&f=44khz_16bit_stereo&src=" + encodedText;

            byte[] audioBytes = restTemplate.getForObject(url, byte[].class);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("audio/mpeg"));

            return new ResponseEntity<>(audioBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("TTS Error: " + e.getMessage()).getBytes());
        }
    }
}
