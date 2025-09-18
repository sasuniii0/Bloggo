package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.Boost;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.exception.ResourceNotFoundException;
import lk.ijse.gdse.repository.BoostRepository;
import lk.ijse.gdse.repository.PostRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.BoostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class BoostServiceImpl implements BoostService {
    private final BoostRepository boostRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    @Override
    public void deleteBoost(Long postId, String name) {
        Boost boost = boostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Boost not found"));
        if (!boost.getUser().getUsername().equals(name)) {
            throw new ResourceNotFoundException("Boost doesn't exist");
        }
        boostRepository.delete(boost);
    }

    @Override
    public int unboostPost(Long postId, String name) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User boostiingUser = userRepository.findByUsername(name)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (post.getBoosts() == null) {
            post.setBoosts(new ArrayList<>());
        }

        Boost existingBoost = post.getBoosts().stream()
                .filter(boost -> boost.getUser().getUsername().equals(name))
                .findFirst()
                .orElse(null);

        if (existingBoost != null) {
            post.getBoosts().remove(existingBoost);
            boostRepository.delete(existingBoost);
            postRepository.save(post);
            return post.getBoosts().size();
        } else {
            throw new ResourceNotFoundException("Boost doesn't exist");
        }

    }
}
