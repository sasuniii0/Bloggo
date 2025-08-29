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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkServiceImpl implements BookmarkService {
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Override
    public Bookmark saveBookmark(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(()-> new RuntimeException("User not found"));

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
    public void removeBookmark(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(()-> new RuntimeException("User not found"));

        Bookmark bookmark = bookmarkRepository.findByPostAndUser(post, user)
                .orElseThrow(()-> new RuntimeException("Bookmark not found"));

        bookmarkRepository.delete(bookmark);
    }

    @Override
    public boolean isPostBookmarkedByUser(Long postId, Long userId) {
        return bookmarkRepository.existsByPostIdAndUserId(postId, userId);
    }

    @Override
    public List<Bookmark> getBookmarksByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new RuntimeException("User not found"));

        return new ArrayList<>(bookmarkRepository.findByUser(user));
    }

    @Override
    public Long getBookmarkCountForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new RuntimeException("Post not found"));

        return bookmarkRepository.countByPost(post);
    }

    @Override
    public Bookmark toggleBookmark(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(()-> new RuntimeException("User not found"));

        Optional<Bookmark> existingBookmark = bookmarkRepository.findByPostAndUser(post, user);

        if (existingBookmark.isPresent()) {
            bookmarkRepository.delete(existingBookmark.get());
            return null;
        }else{
            Bookmark newBookmark = Bookmark.builder()
                    .post(post)
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build();

            return bookmarkRepository.save(newBookmark);
        }
    }
}
