package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.Bookmark;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.BookmarkRepository;
import lk.ijse.gdse.repository.PostRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public Bookmark saveBookmark(Long postId, String username) {
        User user = getUserByUsername(username);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (bookmarkRepository.findByPostAndUser(post, user).isPresent()) {
            throw new RuntimeException("Bookmark already exists");
        }

        Bookmark bookmark = Bookmark.builder()
                .post(post)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        return bookmarkRepository.save(bookmark);
    }

    @Override
    public void removeBookmark(Long postId, String username) {
        User user = getUserByUsername(username);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Bookmark bookmark = bookmarkRepository.findByPostAndUser(post, user)
                .orElseThrow(() -> new RuntimeException("Bookmark not found"));

        bookmarkRepository.delete(bookmark);
    }

    @Override
    public boolean isPostBookmarkedByUser(Long postId, String username) {
        User user = getUserByUsername(username);
        return bookmarkRepository.existsByPostIdAndUserId(postId, user.getUserId());
    }

    @Override
    public List<Bookmark> getBookmarksByUser(String username) {
        User user = getUserByUsername(username);
        return bookmarkRepository.findByUser(user);
    }

    @Override
    public Long getBookmarkCountForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return bookmarkRepository.countByPost(post);
    }

    @Override
    public Bookmark toggleBookmark(Long postId, String username) {
        User user = getUserByUsername(username);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<Bookmark> existing = bookmarkRepository.findByPostAndUser(post, user);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return null;
        }

        Bookmark bookmark = Bookmark.builder()
                .post(post)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        return bookmarkRepository.save(bookmark);
    }
}
