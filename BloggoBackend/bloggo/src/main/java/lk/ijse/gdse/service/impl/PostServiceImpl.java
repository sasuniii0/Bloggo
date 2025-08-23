package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.repository.PostRepository;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    @Override
    public Post publishPost(Post post) {
        return postRepository.save(post);
    }
}
