package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.TagDTO;
import lk.ijse.gdse.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tag")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class TagController {
    private final TagService tagService;

    @GetMapping
    public ResponseEntity<Map<String,Object>> getTags(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "5") int limit
    ){
        List<TagDTO> tags = tagService.getTags(offset,limit);
        Map<String,Object> response = new HashMap<>();
        response.put("tags",tags);
        return ResponseEntity.ok(response);
    }
}
