package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.Comment;
import lk.ijse.gdse.repository.CommentRepository;
import lk.ijse.gdse.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    @Override
    public void deleteComment(Long postId) {
        Comment comment = commentRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        commentRepository.delete(comment);
    }
}
