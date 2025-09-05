package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserUsername(String username); // <-- fetch by username

    Post findByPostId(Long postId);

}
