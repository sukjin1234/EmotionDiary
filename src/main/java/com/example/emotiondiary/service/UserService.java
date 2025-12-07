package com.example.emotiondiary.service;

import com.example.emotiondiary.entity.User;
import com.example.emotiondiary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    
    /**
     * 사용자 ID로 조회
     */
    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }
    
    /**
     * 이메일로 사용자 조회
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * 닉네임으로 사용자 조회
     */
    public Optional<User> findByNickname(String nickname) {
        return userRepository.findByNickname(nickname);
    }
    
    /**
     * 이메일 존재 여부 확인
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * 사용자 생성
     */
    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }
    
    /**
     * 사용자 삭제
     */
    @Transactional
    public void delete(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId);
        }
        userRepository.deleteById(userId);
    }
}

