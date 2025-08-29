package lk.ijse.gdse.service;

import lk.ijse.gdse.entity.Bookmark;

import java.util.List;

public interface BookmarkService {
    Bookmark saveBookmark(Long postId, Long userId);
    void removeBookmark(Long postId, Long userId);
    boolean isPostBookmarkedByUser(Long postId, Long userId);
    List<Bookmark> getBookmarksByUser(Long userId);
    Long getBookmarkCountForPost(Long postId);
    Bookmark toggleBookmark(Long postId, Long userId);
}
