package lk.ijse.gdse.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.BookmarkDTO;
import lk.ijse.gdse.entity.Bookmark;
import lk.ijse.gdse.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
@Tag(name = "Bookmarks", description = "Operations related to Bookmarks")

public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping("/save/{postId}")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "save bookmarks")
    public ResponseEntity<ApiResponseDTO> saveBookmark(
            @PathVariable Long postId,
            Principal principal
    ) {
        Bookmark bookmark = bookmarkService.saveBookmark(postId, principal.getName());
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "saved bookmark",
                bookmark
        ));
    }

    @DeleteMapping("/remove/{postId}")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "remove bookmarks")
    public ResponseEntity<ApiResponseDTO> removeBookmark(
            @PathVariable Long postId,
            Principal principal
    ) {
        bookmarkService.removeBookmark(postId, principal.getName());
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "bookmark removed",
                null
        ));
    }

    @GetMapping("/check/{postId}")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "check if the post is already bookmarked")
    public ResponseEntity<ApiResponseDTO> isPostBookmarked(
            @PathVariable Long postId,
            Principal principal
    ) {
        boolean isBookmarked = bookmarkService.isPostBookmarkedByUser(postId, principal.getName());
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "check bookmark",
                isBookmarked
        ));
    }

    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "get user All bookmarks")
    public ResponseEntity<List<BookmarkDTO>> getUserBookmarks(Principal principal) {
        List<Bookmark> bookmarks = bookmarkService.getBookmarksByUser(principal.getName());

        List<BookmarkDTO> bookmarkDTOS =bookmarks.stream()
                .map(b-> new BookmarkDTO(
                        b.getPost().getPostId(),
                        b.getPost().getCoverImageUrl(),
                        b.getPost().getTitle(),
                        b.getPost().getUser().getUsername(),
                        b.getPost().getContent()
                )).toList();
        return ResponseEntity.ok(bookmarkDTOS);
    }

    @GetMapping("/count/{postId}")
    @Operation(summary = "get bookmark count")
    public ResponseEntity<Long> getBookmarkCount(@PathVariable Long postId) {
        return ResponseEntity.ok(bookmarkService.getBookmarkCountForPost(postId));
    }

    @PostMapping("/toggle/{postId}")
    @Operation(summary = "toggle the bookmark if saved or not")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    public ResponseEntity<?> toggleBookmark(
            @PathVariable Long postId,
            Principal principal
    ) {
        Bookmark result = bookmarkService.toggleBookmark(postId, principal.getName());
        boolean isBookmarked = result != null;

        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "bookmark toggled",
                isBookmarked
        ));
    }
}
