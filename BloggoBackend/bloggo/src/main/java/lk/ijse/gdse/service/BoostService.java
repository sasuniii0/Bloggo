package lk.ijse.gdse.service;

public interface BoostService {
    void deleteBoost(Long postId, String name);

    int unboostPost(Long postId, String name);
}
