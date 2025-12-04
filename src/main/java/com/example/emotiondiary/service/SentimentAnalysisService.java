package com.example.emotiondiary.service;

import com.example.emotiondiary.entity.Diary;
import com.example.emotiondiary.entity.SentimentAnalysis;
import com.example.emotiondiary.entity.SentimentAnalysis.Emotion;
import com.example.emotiondiary.repository.DiaryRepository;
import com.example.emotiondiary.repository.SentimentAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SentimentAnalysisService {
    
    private final SentimentAnalysisRepository sentimentAnalysisRepository;
    private final DiaryRepository diaryRepository;
    
    /**
     * 분석 ID로 조회
     */
    public Optional<SentimentAnalysis> findById(Long analysisId) {
        return sentimentAnalysisRepository.findById(analysisId);
    }
    
    /**
     * 일기 ID로 감정 분석 결과 조회
     */
    public Optional<SentimentAnalysis> findByDiaryId(Long diaryId) {
        return sentimentAnalysisRepository.findByDiaryDiaryId(diaryId);
    }
    
    /**
     * 사용자 ID와 감정으로 감정 분석 결과 조회
     */
    public List<SentimentAnalysis> findByUserIdAndEmotion(Long userId, Emotion emotion) {
        return sentimentAnalysisRepository.findByUserAndEmotion(userId, emotion);
    }
    
    /**
     * 사용자 ID와 년월로 감정 분석 결과 조회
     */
    public List<SentimentAnalysis> findByUserIdAndYearMonth(Long userId, int year, int month) {
        return sentimentAnalysisRepository.findByUserAndYearMonth(userId, year, month);
    }
    
    /**
     * 감정별 통계 조회 (년월 기준)
     */
    public Map<Emotion, Long> getEmotionStatisticsByYearMonth(Long userId, int year, int month) {
        List<Object[]> results = sentimentAnalysisRepository.countByEmotionAndUserAndYearMonth(userId, year, month);
        
        return results.stream()
                .collect(Collectors.toMap(
                    result -> (Emotion) result[0],
                    result -> (Long) result[1]
                ));
    }
    
    /**
     * 감정 분석 결과 생성
     */
    @Transactional
    public SentimentAnalysis save(SentimentAnalysis sentimentAnalysis) {
        // Diary 엔티티가 영속성 컨텍스트에 없는 경우를 대비해 조회
        if (sentimentAnalysis.getDiary() != null && sentimentAnalysis.getDiary().getDiaryId() != null) {
            Diary diary = diaryRepository.findById(sentimentAnalysis.getDiary().getDiaryId())
                    .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다. ID: " + sentimentAnalysis.getDiary().getDiaryId()));
            sentimentAnalysis.setDiary(diary);
        }
        return sentimentAnalysisRepository.save(sentimentAnalysis);
    }
    
    /**
     * 감정 분석 결과 수정
     */
    @Transactional
    public SentimentAnalysis update(Long analysisId, SentimentAnalysis updatedAnalysis) {
        SentimentAnalysis sentimentAnalysis = sentimentAnalysisRepository.findById(analysisId)
                .orElseThrow(() -> new IllegalArgumentException("감정 분석 결과를 찾을 수 없습니다. ID: " + analysisId));
        
        if (updatedAnalysis.getEmotion() != null) {
            sentimentAnalysis.setEmotion(updatedAnalysis.getEmotion());
        }
        if (updatedAnalysis.getConfidence() != null) {
            sentimentAnalysis.setConfidence(updatedAnalysis.getConfidence());
        }
        
        return sentimentAnalysisRepository.save(sentimentAnalysis);
    }
    
    /**
     * 일기 ID로 감정 분석 결과 수정 또는 생성
     */
    @Transactional
    public SentimentAnalysis upsertByDiaryId(Long diaryId, SentimentAnalysis updatedAnalysis) {
        Optional<SentimentAnalysis> existing = sentimentAnalysisRepository.findByDiaryDiaryId(diaryId);
        
        if (existing.isPresent()) {
            SentimentAnalysis sentimentAnalysis = existing.get();
            if (updatedAnalysis.getEmotion() != null) {
                sentimentAnalysis.setEmotion(updatedAnalysis.getEmotion());
            }
            if (updatedAnalysis.getConfidence() != null) {
                sentimentAnalysis.setConfidence(updatedAnalysis.getConfidence());
            }
            return sentimentAnalysisRepository.save(sentimentAnalysis);
        } else {
            // 새로운 감정 분석 결과 생성
            Diary diary = diaryRepository.findById(diaryId)
                    .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다. ID: " + diaryId));
            updatedAnalysis.setDiary(diary);
            return sentimentAnalysisRepository.save(updatedAnalysis);
        }
    }
    
    /**
     * 감정 분석 결과 삭제
     */
    @Transactional
    public void delete(Long analysisId) {
        if (!sentimentAnalysisRepository.existsById(analysisId)) {
            throw new IllegalArgumentException("감정 분석 결과를 찾을 수 없습니다. ID: " + analysisId);
        }
        sentimentAnalysisRepository.deleteById(analysisId);
    }
    
    /**
     * 일기 ID로 감정 분석 결과 삭제
     */
    @Transactional
    public void deleteByDiaryId(Long diaryId) {
        Optional<SentimentAnalysis> analysis = sentimentAnalysisRepository.findByDiaryDiaryId(diaryId);
        if (analysis.isPresent()) {
            sentimentAnalysisRepository.delete(analysis.get());
        }
    }
}

