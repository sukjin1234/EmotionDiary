package com.example.emotiondiary.service;

import ai.onnxruntime.*;
import com.example.emotiondiary.entity.SentimentAnalysis;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import java.io.InputStream;
import java.util.*;

/**
 * PyTorch 모델을 사용한 감정 분석 서비스
 * ONNX Runtime을 통해 모델 추론 수행
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmotionAnalysisService {
    
    private final BertTokenizer tokenizer;
    private final ConfigLoader configLoader;
    
    private OrtEnvironment env;
    private OrtSession session;
    
    // 모델 파일 경로
    private static final String MODEL_PATH = "models/emotion_model_onnx/model.onnx";
    
    // 감정 라벨 매핑 (모델 출력 인덱스 → 감정 Enum)
    private Map<Integer, SentimentAnalysis.Emotion> emotionLabels;
    
    private boolean modelLoaded = false;
    private int maxLength;
    private String[] inputNames;
    private String outputName;
    
    @PostConstruct
    public void initializeModel() {
        try {
            // 설정 로드
            maxLength = configLoader.getMaxLength();
            inputNames = configLoader.getInputNames();
            outputName = configLoader.getOutputName();
            
            // 라벨 매핑 로드 및 변환
            loadEmotionLabels();
            
            // ONNX 환경 및 세션 초기화
            env = OrtEnvironment.getEnvironment();
            OrtSession.SessionOptions opts = new OrtSession.SessionOptions();
            
            // 모델 파일 로드 시도
            ClassPathResource resource = new ClassPathResource(MODEL_PATH);
            
            if (!resource.exists()) {
                log.warn("⚠️ 감정 분석 모델 파일을 찾을 수 없습니다: {}. 키워드 기반 분석으로 대체됩니다.", MODEL_PATH);
                log.warn("   모델 파일을 {} 경로에 저장해주세요.", MODEL_PATH);
                modelLoaded = false;
                return;
            }
            
            InputStream modelInputStream = resource.getInputStream();
            byte[] modelBytes = modelInputStream.readAllBytes();
            
            session = env.createSession(modelBytes, opts);
            modelLoaded = true;
            log.info("✅ 감정 분석 모델 로드 완료: {}", MODEL_PATH);
            log.info("   - Max Length: {}", maxLength);
            log.info("   - Input Names: {}", Arrays.toString(inputNames));
            log.info("   - Output Name: {}", outputName);
            log.info("   - Num Labels: {}", emotionLabels.size());
            
        } catch (Exception e) {
            log.error("❌ 감정 분석 모델 로드 실패: {}", e.getMessage(), e);
            log.warn("키워드 기반 분석으로 대체됩니다.");
            modelLoaded = false;
        }
    }
    
    /**
     * config에서 라벨 매핑을 로드하고 Enum으로 변환
     */
    private void loadEmotionLabels() {
        Map<String, String> labelMapping = configLoader.getLabelMapping();
        emotionLabels = new HashMap<>();
        
        // 한국어 라벨 → Enum 매핑
        Map<String, SentimentAnalysis.Emotion> koreanToEnum = Map.of(
            "기쁨", SentimentAnalysis.Emotion.HAPPY,
            "불안", SentimentAnalysis.Emotion.ANXIETY,
            "당황", SentimentAnalysis.Emotion.EMBARRASSED,
            "슬픔", SentimentAnalysis.Emotion.SAD,
            "분노", SentimentAnalysis.Emotion.ANGRY,
            "상처", SentimentAnalysis.Emotion.HURT
        );
        
        // label_mapping.json에서 로드: "0": "기쁨" 형식
        for (Map.Entry<String, String> entry : labelMapping.entrySet()) {
            try {
                int index = Integer.parseInt(entry.getKey());
                String koreanLabel = entry.getValue();
                SentimentAnalysis.Emotion emotion = koreanToEnum.get(koreanLabel);
                
                if (emotion != null) {
                    emotionLabels.put(index, emotion);
                    log.debug("라벨 매핑: {} -> {}", index, emotion);
                } else {
                    log.warn("알 수 없는 라벨: {}", koreanLabel);
                }
            } catch (NumberFormatException e) {
                log.warn("잘못된 라벨 인덱스: {}", entry.getKey());
            }
        }
        
        // 매핑이 비어있으면 기본값 사용
        if (emotionLabels.isEmpty()) {
            log.warn("라벨 매핑이 비어있어 기본 매핑을 사용합니다.");
            emotionLabels = Map.of(
                0, SentimentAnalysis.Emotion.HAPPY,
                1, SentimentAnalysis.Emotion.ANXIETY,
                2, SentimentAnalysis.Emotion.EMBARRASSED,
                3, SentimentAnalysis.Emotion.SAD,
                4, SentimentAnalysis.Emotion.ANGRY,
                5, SentimentAnalysis.Emotion.HURT
            );
        }
    }
    
    @PreDestroy
    public void cleanup() {
        try {
            if (session != null) {
                session.close();
            }
            if (env != null) {
                env.close();
            }
            log.info("감정 분석 모델 리소스 해제 완료");
        } catch (Exception e) {
            log.error("리소스 해제 중 오류", e);
        }
    }
    
    /**
     * 텍스트를 감정으로 분석
     * 모델이 로드되지 않은 경우 키워드 기반 분석으로 대체
     * 
     * @param text 분석할 텍스트
     * @return 감정 Enum (HAPPY, ANXIETY, EMBARRASSED, SAD, ANGRY, HURT)
     */
    public SentimentAnalysis.Emotion analyzeEmotion(String text) {
        if (text == null || text.trim().isEmpty()) {
            return SentimentAnalysis.Emotion.HAPPY; // 기본값
        }
        
        if (!modelLoaded) {
            log.debug("모델 미로드 상태: 키워드 기반 분석 수행");
            return analyzeByKeywords(text);
        }
        
        try {
            // 1. 텍스트 토크나이징
            BertTokenizer.TokenizationResult tokenResult = tokenizer.tokenize(text);
            long[] inputIds = tokenResult.getInputIds();
            long[] attentionMask = tokenResult.getAttentionMask();
            
            // 2. ONNX 입력 생성 (배치 차원 추가: [1, max_length])
            long[][] inputIdsArray = new long[1][];
            inputIdsArray[0] = inputIds;
            
            long[][] attentionMaskArray = new long[1][];
            attentionMaskArray[0] = attentionMask;
            
            OnnxTensor inputIdsTensor = OnnxTensor.createTensor(env, inputIdsArray);
            OnnxTensor attentionMaskTensor = OnnxTensor.createTensor(env, attentionMaskArray);
            
            // 3. 모델 추론 실행
            Map<String, OnnxTensorLike> inputs = new HashMap<>();
            inputs.put(inputNames[0], inputIdsTensor); // "input_ids"
            inputs.put(inputNames[1], attentionMaskTensor); // "attention_mask"
            
            try (OrtSession.Result output = session.run(inputs)) {
                // 4. 출력 결과 추출 (logits: [batch_size, num_labels])
                OnnxValue outputValue = output.get(outputName).orElseThrow();
                float[][] logits = (float[][]) outputValue.getValue();
                
                // 5. Softmax 적용하여 확률 계산
                float[] probabilities = softmax(logits[0]);
                
                // 6. 가장 높은 확률의 감정 선택
                int predictedIndex = findMaxIndex(probabilities);
                SentimentAnalysis.Emotion emotion = emotionLabels.get(predictedIndex);
                
                float confidence = probabilities[predictedIndex];
                log.debug("감정 분석 결과: {} (확률: {:.4f})", emotion, confidence);
                
                return emotion != null ? emotion : SentimentAnalysis.Emotion.HAPPY;
            } finally {
                inputIdsTensor.close();
                attentionMaskTensor.close();
            }
            
        } catch (Exception e) {
            log.error("감정 분석 중 오류 발생, 키워드 기반 분석으로 대체: {}", e.getMessage(), e);
            return analyzeByKeywords(text);
        }
    }
    
    /**
     * Softmax 함수 적용
     */
    private float[] softmax(float[] logits) {
        float[] expValues = new float[logits.length];
        
        // 최대값 찾기
        float maxLogit = logits[0];
        for (float logit : logits) {
            if (logit > maxLogit) {
                maxLogit = logit;
            }
        }
        
        float sum = 0.0f;
        
        // 수치 안정성을 위해 최대값을 빼줌
        for (int i = 0; i < logits.length; i++) {
            expValues[i] = (float) Math.exp(logits[i] - maxLogit);
            sum += expValues[i];
        }
        
        // 정규화
        for (int i = 0; i < expValues.length; i++) {
            expValues[i] /= sum;
        }
        
        return expValues;
    }
    
    /**
     * 배열에서 최대값의 인덱스 찾기
     */
    private int findMaxIndex(float[] array) {
        if (array == null || array.length == 0) {
            return 0;
        }
        
        int maxIndex = 0;
        float maxValue = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] > maxValue) {
                maxValue = array[i];
                maxIndex = i;
            }
        }
        return maxIndex;
    }
    
    /**
     * 키워드 기반 감정 분석 (모델 미로드 시 대체용)
     */
    private SentimentAnalysis.Emotion analyzeByKeywords(String text) {
        String lowerText = text.toLowerCase();
        
        Map<SentimentAnalysis.Emotion, Integer> scores = new HashMap<>();
        scores.put(SentimentAnalysis.Emotion.HAPPY, 0);
        scores.put(SentimentAnalysis.Emotion.ANXIETY, 0);
        scores.put(SentimentAnalysis.Emotion.EMBARRASSED, 0);
        scores.put(SentimentAnalysis.Emotion.SAD, 0);
        scores.put(SentimentAnalysis.Emotion.ANGRY, 0);
        scores.put(SentimentAnalysis.Emotion.HURT, 0);
        
        // 키워드 매칭
        String[] happyKeywords = {"행복", "기쁨", "좋아", "즐거", "웃", "신나", "최고", "사랑", "감사"};
        String[] anxietyKeywords = {"불안", "걱정", "두렵", "무서", "조심", "긴장", "초조"};
        String[] embarrassedKeywords = {"당황", "어색", "부끄", "창피", "민망"};
        String[] sadKeywords = {"슬프", "우울", "눈물", "힘들", "외로", "아프"};
        String[] angryKeywords = {"화", "짜증", "분노", "싫", "미워", "열받"};
        String[] hurtKeywords = {"상처", "아픔", "서러", "서운", "섭섭"};
        
        countKeywords(lowerText, happyKeywords, scores, SentimentAnalysis.Emotion.HAPPY);
        countKeywords(lowerText, anxietyKeywords, scores, SentimentAnalysis.Emotion.ANXIETY);
        countKeywords(lowerText, embarrassedKeywords, scores, SentimentAnalysis.Emotion.EMBARRASSED);
        countKeywords(lowerText, sadKeywords, scores, SentimentAnalysis.Emotion.SAD);
        countKeywords(lowerText, angryKeywords, scores, SentimentAnalysis.Emotion.ANGRY);
        countKeywords(lowerText, hurtKeywords, scores, SentimentAnalysis.Emotion.HURT);
        
        // 가장 높은 점수의 감정 반환
        return scores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(SentimentAnalysis.Emotion.HAPPY);
    }
    
    private void countKeywords(String text, String[] keywords, 
                              Map<SentimentAnalysis.Emotion, Integer> scores, 
                              SentimentAnalysis.Emotion emotion) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                scores.put(emotion, scores.get(emotion) + 1);
            }
        }
    }
}
