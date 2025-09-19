package lk.ijse.gdse.controller;

import io.swagger.v3.oas.annotations.Operation;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.TagDTO;
import lk.ijse.gdse.entity.Tag;
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
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tags", description = "Operations related to Tags")

public class TagController {
    private final TagService tagService;

    @GetMapping
    @Operation(summary = "get the all tags")
    public ResponseEntity<Map<String,Object>> getTags(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "5") int limit
    ){
        List<TagDTO> tags = tagService.getTags(offset,limit);
        Map<String,Object> response = new HashMap<>();
        response.put("tags",tags);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search/{keyword}")
    @Operation(summary = "search tags by keyword")
    public ResponseEntity<ApiResponseDTO> searchTags(@PathVariable String keyword) {
        List<Tag> tags = tagService.searchTags(keyword);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Tags found", tags));
    }
}
