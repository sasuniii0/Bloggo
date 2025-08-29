package lk.ijse.gdse.service;

import lk.ijse.gdse.entity.Bookmark;

import java.util.List;

public interface BookmarkService {
    Bookmark saveBookmark(Long postId, String username);
    void removeBookmark(Long postId, String username);
    boolean isPostBookmarkedByUser(Long postId, String username);
    List<Bookmark> getBookmarksByUser(String username);
    Long getBookmarkCountForPost(Long postId);
    Bookmark toggleBookmark(Long postId, String username);
}
