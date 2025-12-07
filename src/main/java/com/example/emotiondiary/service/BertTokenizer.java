package com.example.emotiondiary.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

/**
 * BERT 토크나이저 구현 (간단한 WordPiece 기반)
 * vocab.txt 파일을 사용하여 토큰화 수행
 */
@Component
@Slf4j
public class BertTokenizer {
    
    private static final String VOCAB_PATH = "models/emotion_model_onnx/vocab.txt";
    private static final int MAX_LENGTH = 512;
    private static final String CLS_TOKEN = "[CLS]";
    private static final String SEP_TOKEN = "[SEP]";
    private static final String PAD_TOKEN = "[PAD]";
    private static final String UNK_TOKEN = "[UNK]";
    
    private Map<String, Integer> vocabMap;
    private Map<Integer, String> idToTokenMap;
    
    @PostConstruct
    public void initialize() {
        try {
            loadVocab();
            log.info("✅ BERT 토크나이저 초기화 완료 (어휘 크기: {})", vocabMap.size());
        } catch (Exception e) {
            log.error("❌ BERT 토크나이저 초기화 실패", e);
            vocabMap = new HashMap<>();
            idToTokenMap = new HashMap<>();
        }
    }
    
    /**
     * vocab.txt 파일 로드
     */
    private void loadVocab() throws Exception {
        vocabMap = new HashMap<>();
        idToTokenMap = new HashMap<>();
        
        ClassPathResource resource = new ClassPathResource(VOCAB_PATH);
        if (!resource.exists()) {
            log.warn("⚠️ Vocab 파일을 찾을 수 없습니다: {}", VOCAB_PATH);
            return;
        }
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int index = 0;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (!line.isEmpty()) {
                    vocabMap.put(line, index);
                    idToTokenMap.put(index, line);
                    index++;
                }
            }
        }
        
        log.info("Vocab 로드 완료: {} 개 토큰", vocabMap.size());
    }
    
    /**
     * 텍스트를 토큰 ID로 변환
     * 
     * @param text 원본 텍스트
     * @return 토큰 ID 배열과 어텐션 마스크
     */
    public TokenizationResult tokenize(String text) {
        if (vocabMap == null || vocabMap.isEmpty()) {
            log.warn("Vocab이 로드되지 않았습니다. 빈 결과 반환");
            return new TokenizationResult(new long[MAX_LENGTH], new long[MAX_LENGTH]);
        }
        
        if (text == null || text.trim().isEmpty()) {
            text = "";
        }
        
        // 1. 기본 토크나이징 (공백 기준)
        List<String> tokens = basicTokenize(text);
        
        // 2. WordPiece 토크나이징
        List<String> wordPieceTokens = new ArrayList<>();
        for (String token : tokens) {
            wordPieceTokens.addAll(wordPieceTokenize(token));
        }
        
        // 3. 특수 토큰 추가 [CLS] + tokens + [SEP]
        List<String> allTokens = new ArrayList<>();
        allTokens.add(CLS_TOKEN);
        allTokens.addAll(wordPieceTokens);
        allTokens.add(SEP_TOKEN);
        
        // 4. 토큰을 ID로 변환
        List<Long> tokenIds = new ArrayList<>();
        for (String token : allTokens) {
            int tokenId = vocabMap.getOrDefault(token, vocabMap.getOrDefault(UNK_TOKEN, 0));
            tokenIds.add((long) tokenId);
        }
        
        // 5. 패딩 또는 트렁케이션
        long[] inputIds = new long[MAX_LENGTH];
        long[] attentionMask = new long[MAX_LENGTH];
        
        int actualLength = Math.min(tokenIds.size(), MAX_LENGTH);
        
        for (int i = 0; i < actualLength; i++) {
            inputIds[i] = tokenIds.get(i);
            attentionMask[i] = 1L; // 실제 토큰
        }
        
        // 패딩
        int padTokenId = vocabMap.getOrDefault(PAD_TOKEN, 0);
        for (int i = actualLength; i < MAX_LENGTH; i++) {
            inputIds[i] = padTokenId;
            attentionMask[i] = 0L; // 패딩 토큰
        }
        
        return new TokenizationResult(inputIds, attentionMask);
    }
    
    /**
     * 기본 토크나이징 (공백, 구두점 기준)
     */
    private List<String> basicTokenize(String text) {
        // 한글과 영문, 숫자, 기본 구두점을 유지하면서 분리
        Pattern pattern = Pattern.compile("\\S+");
        List<String> tokens = new ArrayList<>();
        
        java.util.regex.Matcher matcher = pattern.matcher(text);
        while (matcher.find()) {
            String token = matcher.group();
            // 구두점 분리
            String[] parts = token.split("(?<=[.,!?;:])|(?=[.,!?;:])");
            for (String part : parts) {
                if (!part.isEmpty()) {
                    tokens.add(part);
                }
            }
        }
        
        return tokens;
    }
    
    /**
     * WordPiece 토크나이징
     * 단어를 서브워드로 분리 (vocab에 있는 가장 긴 서브워드로 매칭)
     */
    private List<String> wordPieceTokenize(String token) {
        if (vocabMap.containsKey(token)) {
            return Collections.singletonList(token);
        }
        
        List<String> output = new ArrayList<>();
        int start = 0;
        
        while (start < token.length()) {
            int end = token.length();
            String curSubstr = null;
            
            // 가장 긴 서브워드 찾기
            while (start < end) {
                String substr = token.substring(start, end);
                if (start > 0) {
                    substr = "##" + substr; // 서브워드는 ## 접두사
                }
                
                if (vocabMap.containsKey(substr)) {
                    curSubstr = substr;
                    break;
                }
                end--;
            }
            
            if (curSubstr == null) {
                // 매칭되지 않으면 UNK 토큰
                output.add(UNK_TOKEN);
                break;
            } else {
                output.add(curSubstr);
                start = end;
            }
        }
        
        return output.isEmpty() ? Collections.singletonList(UNK_TOKEN) : output;
    }
    
    /**
     * 토크나이징 결과를 담는 클래스
     */
    public static class TokenizationResult {
        private final long[] inputIds;
        private final long[] attentionMask;
        
        public TokenizationResult(long[] inputIds, long[] attentionMask) {
            this.inputIds = inputIds;
            this.attentionMask = attentionMask;
        }
        
        public long[] getInputIds() {
            return inputIds;
        }
        
        public long[] getAttentionMask() {
            return attentionMask;
        }
    }
}


