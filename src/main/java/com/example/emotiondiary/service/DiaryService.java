package com.example.emotiondiary.service;

import com.example.emotiondiary.entity.Diary;
import com.example.emotiondiary.entity.User;
import com.example.emotiondiary.repository.DiaryRepository;
import com.example.emotiondiary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiaryService {
    
    private final DiaryRepository diaryRepository;
    private final UserRepository userRepository;
    
    /**
     * 일기 ID로 조회
     */
    public Optional<Diary> findById(Long diaryId) {
        return diaryRepository.findById(diaryId);
    }
    
    /**
     * 일기 ID로 조회 (User 엔티티 함께 로드)
     */
    public Optional<Diary> findByIdWithUser(Long diaryId) {
        return diaryRepository.findByIdWithUser(diaryId);
    }
    
    /**
     * 사용자 ID로 일기 목록 조회 (최신순)
     */
    public List<Diary> findByUserId(Long userId) {
        return diaryRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * 사용자 ID와 날짜로 일기 목록 조회
     */
    public List<Diary> findByUserIdAndDate(Long userId, LocalDate date) {
        return diaryRepository.findByUserUserIdAndDiaryDateOrderByCreatedAtDesc(userId, date);
    }
    
    /**
     * 사용자 ID와 년월로 일기 목록 조회
     */
    public List<Diary> findByUserIdAndYearMonth(Long userId, int year, int month) {
        return diaryRepository.findByUserAndYearMonth(userId, year, month);
    }
    
    /**
     * 사용자의 일기 개수 조회
     */
    public long countByUserId(Long userId) {
        return diaryRepository.countByUserUserId(userId);
    }
    
    /**
     * 일기 생성
     */
    @Transactional
    public Diary save(Diary diary) {
        // User 엔티티가 영속성 컨텍스트에 없는 경우를 대비해 조회
        if (diary.getUser() != null && diary.getUser().getUserId() != null) {
            User user = userRepository.findById(diary.getUser().getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + diary.getUser().getUserId()));
            diary.setUser(user);
        }
        return diaryRepository.save(diary);
    }
    
    /**
     * 일기 정보 수정
     */
    @Transactional
    public Diary update(Long diaryId, Diary updatedDiary) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다. ID: " + diaryId));
        
        if (updatedDiary.getTitle() != null) {
            diary.setTitle(updatedDiary.getTitle());
        }
        if (updatedDiary.getContent() != null) {
            diary.setContent(updatedDiary.getContent());
        }
        if (updatedDiary.getDiaryDate() != null) {
            diary.setDiaryDate(updatedDiary.getDiaryDate());
        }
        
        return diaryRepository.save(diary);
    }
    
    /**
     * 일기 삭제
     */
    @Transactional
    public void delete(Long diaryId) {
        if (!diaryRepository.existsById(diaryId)) {
            throw new IllegalArgumentException("일기를 찾을 수 없습니다. ID: " + diaryId);
        }
        diaryRepository.deleteById(diaryId);
    }
    
    /**
     * 사용자의 특정 날짜 일기 존재 여부 확인
     */
    public boolean existsByUserIdAndDate(Long userId, LocalDate date) {
        List<Diary> diaries = diaryRepository.findByUserUserIdAndDiaryDateOrderByCreatedAtDesc(userId, date);
        return !diaries.isEmpty();
    }
}

