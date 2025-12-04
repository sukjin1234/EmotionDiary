package com.example.emotiondiary.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sentiment_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SentimentAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diary_id", nullable = false, unique = true)
    private Diary diary;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "emotion", nullable = false, length = 20)
    private Emotion emotion;
    
    @Column(name = "confidence", nullable = false)
    private Float confidence;
    
    @Column(name = "analyzed_at", nullable = false)
    private LocalDateTime analyzedAt;
    
    @PrePersist
    protected void onCreate() {
        analyzedAt = LocalDateTime.now();
    }
    
    // 감정 타입 열거형
    public enum Emotion {
        HAPPY,
        SAD,
        ANGER
    }
}

