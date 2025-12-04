package com.example.emotiondiary.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "diaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Diary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "diary_id")
    private Long diaryId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "title", length = 200)
    private String title;
    
    @Column(name = "diary_date", nullable = false)
    private LocalDate diaryDate;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 일대다 관계: 한 일기에 여러 이미지
    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DiaryImage> diaryImages = new ArrayList<>();
    
    // 일대일 관계: 한 일기당 하나의 감정 분석
    @OneToOne(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    private SentimentAnalysis sentimentAnalysis;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

