package lk.ijse.gdse.controller;

import com.nimbusds.oauth2.sdk.http.HTTPResponse;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.entity.Bookmark;
import lk.ijse.gdse.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class BookmarkController {
    private final BookmarkService bookmarkService;

    @PostMapping("/save/{postId}")
    public ResponseEntity<ApiResponseDTO> saveBookmark(
            @PathVariable Long postId,
            @RequestHeader("X-User-Id") Long userId
    ){
        try{
            Bookmark bookmark = bookmarkService.saveBookmark(postId, userId);
            return ResponseEntity.ok(new ApiResponseDTO(
                    200,
                    "saved bookmark",
                    bookmark
            ));
        }catch (RuntimeException e){
            return ResponseEntity.ok(new ApiResponseDTO(
                    400,
                    "failed to save",
                    null
            ));
        }
    }

    @DeleteMapping("/remove/{postId}")
    public ResponseEntity<ApiResponseDTO> removeBookmark(
            @PathVariable Long postId,
            @RequestHeader("X-User-Id") Long userId
    ){
        try{
            bookmarkService.removeBookmark(postId, userId);
            return ResponseEntity.ok(new ApiResponseDTO(
                    200,
                    "bookmark removed",
                    null
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(new ApiResponseDTO(
                    400,
                    "failed",
                    null
            ));
        }
    }

    @GetMapping("/check/{postId}")
    public ResponseEntity<ApiResponseDTO> isPostBookmarked(
            @PathVariable Long postId,
            @RequestHeader("X-User-Id") Long userId
    ){
        boolean isBookmarked = bookmarkService.isPostBookmarkedByUser(postId, userId);
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "saved",
                isBookmarked
        ));
    }

    @GetMapping("/user")
    public ResponseEntity<List<Bookmark>> getUserBookmarks(
            @RequestHeader("X-User-Id") Long userId) {

        List<Bookmark> bookmarks = bookmarkService.getBookmarksByUser(userId);
        return ResponseEntity.ok(bookmarks);
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<Long> getBookmarkCount(@PathVariable Long postId) {
        Long count = bookmarkService.getBookmarkCountForPost(postId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/toggle/{postId}")
    public ResponseEntity<?> toggleBookmark(
            @PathVariable Long postId,
            @RequestHeader("X-User-Id") Long userId) {

        try {
            Bookmark result = bookmarkService.toggleBookmark(postId, userId);
            // Return true if bookmarked, false if unbookmarked
            return ResponseEntity.ok(result != null);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
