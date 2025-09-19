package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.SummeryRequestDTO;
import lk.ijse.gdse.dto.SummeryResponseDTO;
import lk.ijse.gdse.service.SummeryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/summary")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class SummeryController {
    private final SummeryService summeryService;

    @PostMapping
    public ResponseEntity<SummeryResponseDTO> summarize(@RequestBody SummeryRequestDTO request) {
        return ResponseEntity.ok(summeryService.summarize(request));
    }


   /* @PostMapping
    public ResponseEntity<SummeryResponseDTO> generateSummary(@RequestBody SummeryRequestDTO request) {
        String summary = summeryService.generateSummary(request.getText());
        return ResponseEntity.ok(new SummeryResponseDTO(summary));
    }*/
}
