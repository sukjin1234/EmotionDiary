package com.example.emotiondiary.repository;

import com.example.emotiondiary.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Long> {
    
    /**
     * 사용자 ID로 일기 목록 조회 (최신순)
     */
    List<Diary> findByUserUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * 사용자 ID와 날짜로 일기 목록 조회
     */
    List<Diary> findByUserUserIdAndDiaryDateOrderByCreatedAtDesc(Long userId, LocalDate diaryDate);
    
    /**
     * 사용자 ID와 년월로 일기 목록 조회
     */
    @Query("SELECT d FROM Diary d WHERE d.user.userId = :userId " +
           "AND YEAR(d.diaryDate) = :year AND MONTH(d.diaryDate) = :month " +
           "ORDER BY d.diaryDate DESC, d.createdAt DESC")
    List<Diary> findByUserAndYearMonth(@Param("userId") Long userId, 
                                        @Param("year") int year, 
                                        @Param("month") int month);
    
    /**
     * 사용자의 일기 개수 조회
     */
    long countByUserUserId(Long userId);
    
    /**
     * 일기 ID로 조회 (User 엔티티 함께 로드)
     */
    @Query("SELECT d FROM Diary d LEFT JOIN FETCH d.user WHERE d.diaryId = :diaryId")
    Optional<Diary> findByIdWithUser(@Param("diaryId") Long diaryId);
}

