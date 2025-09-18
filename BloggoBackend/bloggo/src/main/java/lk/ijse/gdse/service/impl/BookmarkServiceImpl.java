package lk.ijse.gdse.service.impl;

import jakarta.transaction.Transactional;
import lk.ijse.gdse.entity.*;
import lk.ijse.gdse.exception.ResourceAlreadyFoundException;
import lk.ijse.gdse.exception.ResourceNotFoundException;
import lk.ijse.gdse.exception.UserNotFoundException;
import lk.ijse.gdse.repository.BookmarkRepository;
import lk.ijse.gdse.repository.NotificationRepository;
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
    private final NotificationRepository notificationRepository;

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Transactional
    @Override
    public Bookmark saveBookmark(Long postId, String username) {
        User user = getUserByUsername(username);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (bookmarkRepository.findByPostAndUser(post, user).isPresent()) {
            throw new ResourceAlreadyFoundException("Bookmark already exists");
        }

        Bookmark bookmark = Bookmark.builder()
                .post(post)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        // --- SEND NOTIFICATION TO POST OWNER ---
        User postOwner = post.getUser();
        if (postOwner != null) {
            Notification notification = Notification.builder()
                    .user(postOwner)
                    .message(user.getUsername() + " saved your post: " + post.getTitle())
                    .type(Type.BOOKMARK)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            Notification saved = notificationRepository.save(notification);
            System.out.println("Notification saved with ID: " + saved.getUser().getUsername());
        }

        return bookmarkRepository.save(bookmark);
    }


    @Override
    public void removeBookmark(Long postId, String username) {
        User user = getUserByUsername(username);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Bookmark bookmark = bookmarkRepository.findByPostAndUser(post, user)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark not found"));

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
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        return bookmarkRepository.countByPost(post);
    }

    @Override
    public Bookmark toggleBookmark(Long postId, String username) {
        User user = getUserByUsername(username);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

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
