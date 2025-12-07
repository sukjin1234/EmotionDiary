package com.example.emotiondiary.service;

import com.example.emotiondiary.entity.Diary;
import com.example.emotiondiary.entity.DiaryImage;
import com.example.emotiondiary.repository.DiaryImageRepository;
import com.example.emotiondiary.repository.DiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiaryImageService {
    
    private final DiaryImageRepository diaryImageRepository;
    private final DiaryRepository diaryRepository;
    
    /**
     * 일기 ID로 이미지 목록 조회 (정렬 순서대로)
     */
    public List<DiaryImage> findByDiaryId(Long diaryId) {
        return diaryImageRepository.findByDiaryDiaryIdOrderBySortOrderAsc(diaryId);
    }
    
    /**
     * 이미지 생성
     */
    @Transactional
    public DiaryImage save(DiaryImage diaryImage) {
        // Diary 엔티티가 영속성 컨텍스트에 없는 경우를 대비해 조회
        if (diaryImage.getDiary() != null && diaryImage.getDiary().getDiaryId() != null) {
            Diary diary = diaryRepository.findById(diaryImage.getDiary().getDiaryId())
                    .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다. ID: " + diaryImage.getDiary().getDiaryId()));
            diaryImage.setDiary(diary);
        }
        return diaryImageRepository.save(diaryImage);
    }
    
    /**
     * 여러 이미지 일괄 생성
     */
    @Transactional
    public List<DiaryImage> saveAll(List<DiaryImage> diaryImages) {
        // 각 이미지의 Diary 엔티티 확인 및 설정
        diaryImages.forEach(image -> {
            if (image.getDiary() != null && image.getDiary().getDiaryId() != null) {
                Diary diary = diaryRepository.findById(image.getDiary().getDiaryId())
                        .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다. ID: " + image.getDiary().getDiaryId()));
                image.setDiary(diary);
            }
        });
        return diaryImageRepository.saveAll(diaryImages);
    }
    
    /**
     * 일기의 모든 이미지 삭제
     */
    @Transactional
    public void deleteByDiaryId(Long diaryId) {
        diaryImageRepository.deleteByDiaryDiaryId(diaryId);
    }
}

