package lk.ijse.gdse.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/earnings")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class EarningController {
}
