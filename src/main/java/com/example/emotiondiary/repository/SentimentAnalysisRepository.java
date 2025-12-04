package com.example.emotiondiary.repository;

import com.example.emotiondiary.entity.SentimentAnalysis;
import com.example.emotiondiary.entity.SentimentAnalysis.Emotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SentimentAnalysisRepository extends JpaRepository<SentimentAnalysis, Long> {
    
    /**
     * 일기 ID로 감정 분석 결과 조회
     */
    Optional<SentimentAnalysis> findByDiaryDiaryId(Long diaryId);
    
    /**
     * 사용자 ID와 감정으로 감정 분석 결과 조회
     */
    @Query("SELECT sa FROM SentimentAnalysis sa WHERE sa.diary.user.userId = :userId " +
           "AND sa.emotion = :emotion ORDER BY sa.diary.diaryDate DESC")
    List<SentimentAnalysis> findByUserAndEmotion(@Param("userId") Long userId, 
                                                   @Param("emotion") Emotion emotion);
    
    /**
     * 사용자 ID와 년월로 감정 분석 결과 조회
     */
    @Query("SELECT sa FROM SentimentAnalysis sa WHERE sa.diary.user.userId = :userId " +
           "AND YEAR(sa.diary.diaryDate) = :year AND MONTH(sa.diary.diaryDate) = :month " +
           "ORDER BY sa.diary.diaryDate DESC")
    List<SentimentAnalysis> findByUserAndYearMonth(@Param("userId") Long userId, 
                                                     @Param("year") int year, 
                                                     @Param("month") int month);
    
    /**
     * 감정별 통계 조회
     */
    @Query("SELECT sa.emotion, COUNT(sa) FROM SentimentAnalysis sa " +
           "WHERE sa.diary.user.userId = :userId " +
           "AND YEAR(sa.diary.diaryDate) = :year AND MONTH(sa.diary.diaryDate) = :month " +
           "GROUP BY sa.emotion")
    List<Object[]> countByEmotionAndUserAndYearMonth(@Param("userId") Long userId, 
                                                       @Param("year") int year, 
                                                       @Param("month") int month);
}

