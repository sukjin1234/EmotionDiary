package com.example.emotiondiary.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * 모델 설정 파일 로더
 */
@Component
@Slf4j
public class ConfigLoader {
    
    private static final String CONFIG_PATH = "models/emotion_model_onnx/config.json";
    private static final String LABEL_MAPPING_PATH = "models/emotion_model_onnx/label_mapping.json";
    
    private Map<String, Object> config;
    private Map<String, String> labelMapping;
    private ObjectMapper objectMapper;
    
    public ConfigLoader() {
        this.objectMapper = new ObjectMapper();
    }
    
    @PostConstruct
    public void loadConfigs() {
        try {
            loadConfig();
            loadLabelMapping();
            log.info("✅ 모델 설정 로드 완료");
        } catch (Exception e) {
            log.error("❌ 모델 설정 로드 실패", e);
            config = new HashMap<>();
            labelMapping = new HashMap<>();
        }
    }
    
    private void loadConfig() throws Exception {
        ClassPathResource resource = new ClassPathResource(CONFIG_PATH);
        if (!resource.exists()) {
            log.warn("⚠️ Config 파일을 찾을 수 없습니다: {}", CONFIG_PATH);
            config = new HashMap<>();
            return;
        }
        
        try (InputStream is = resource.getInputStream()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> loadedConfig = objectMapper.readValue(is, Map.class);
            config = loadedConfig;
        }
    }
    
    private void loadLabelMapping() throws Exception {
        ClassPathResource resource = new ClassPathResource(LABEL_MAPPING_PATH);
        if (!resource.exists()) {
            log.warn("⚠️ Label mapping 파일을 찾을 수 없습니다: {}", LABEL_MAPPING_PATH);
            labelMapping = new HashMap<>();
            return;
        }
        
        try (InputStream is = resource.getInputStream()) {
            @SuppressWarnings("unchecked")
            Map<String, String> loadedMapping = objectMapper.readValue(is, Map.class);
            labelMapping = loadedMapping;
        }
    }
    
    public int getMaxLength() {
        if (config != null && config.containsKey("max_length")) {
            return (Integer) config.get("max_length");
        }
        return 512; // 기본값
    }
    
    public int getNumLabels() {
        if (config != null && config.containsKey("num_labels")) {
            return (Integer) config.get("num_labels");
        }
        return 6; // 기본값
    }
    
    @SuppressWarnings("unchecked")
    public String[] getInputNames() {
        if (config != null && config.containsKey("input_names")) {
            Object inputNamesObj = config.get("input_names");
            if (inputNamesObj instanceof java.util.List) {
                java.util.List<String> list = (java.util.List<String>) inputNamesObj;
                return list.toArray(new String[0]);
            }
        }
        return new String[]{"input_ids", "attention_mask"}; // 기본값
    }
    
    @SuppressWarnings("unchecked")
    public String getOutputName() {
        if (config != null && config.containsKey("output_names")) {
            Object outputNamesObj = config.get("output_names");
            if (outputNamesObj instanceof java.util.List) {
                java.util.List<String> list = (java.util.List<String>) outputNamesObj;
                if (!list.isEmpty()) {
                    return list.get(0);
                }
            }
        }
        return "logits"; // 기본값
    }
    
    public Map<String, String> getLabelMapping() {
        return labelMapping != null ? new HashMap<>(labelMapping) : new HashMap<>();
    }
}

