package com.example.emotiondiary.repository;

import com.example.emotiondiary.entity.DiaryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaryImageRepository extends JpaRepository<DiaryImage, Long> {
    
    /**
     * 일기 ID로 이미지 목록 조회 (정렬 순서대로)
     */
    List<DiaryImage> findByDiaryDiaryIdOrderBySortOrderAsc(Long diaryId);
    
    /**
     * 일기 ID로 이미지 삭제
     */
    void deleteByDiaryDiaryId(Long diaryId);
}

