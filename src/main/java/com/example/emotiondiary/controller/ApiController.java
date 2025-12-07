package com.example.emotiondiary.controller;

import com.example.emotiondiary.entity.Diary;
import com.example.emotiondiary.entity.DiaryImage;
import com.example.emotiondiary.entity.SentimentAnalysis;
import com.example.emotiondiary.entity.User;
import com.example.emotiondiary.service.DiaryImageService;
import com.example.emotiondiary.service.DiaryService;
import com.example.emotiondiary.service.EmotionAnalysisService;
import com.example.emotiondiary.service.SentimentAnalysisService;
import com.example.emotiondiary.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

@Controller
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApiController {
    
    private final UserService userService;
    private final DiaryService diaryService;
    private final DiaryImageService diaryImageService;
    private final SentimentAnalysisService sentimentAnalysisService;
    private final EmotionAnalysisService emotionAnalysisService;
    
    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> login(@RequestBody Map<String, String> loginData, 
                                     HttpSession session) {
        String userId = loginData.get("userId");
        String password = loginData.get("password");
        
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null || userId.trim().isEmpty() || 
            password == null || password.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "아이디와 비밀번호를 입력해주세요.");
            return response;
        }
        
        // 이메일 또는 닉네임으로 사용자 조회
        Optional<User> userOpt = userService.findByEmail(userId.trim());
        if (userOpt.isEmpty()) {
            userOpt = userService.findByNickname(userId.trim());
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // 비밀번호 검증 (실제로는 암호화된 비밀번호와 비교해야 함)
            if (password.equals(user.getPassword())) {
                session.setAttribute("userId", user.getUserId());
                session.setAttribute("username", user.getNickname() != null ? user.getNickname() : user.getEmail());
            response.put("success", true);
        } else {
            response.put("success", false);
                response.put("message", "비밀번호가 올바르지 않습니다.");
            }
        } else {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
        }
        
        return response;
    }
    
    @PostMapping(value = "/logout", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return response;
    }
    
    @PostMapping(value = "/register", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> register(@RequestBody Map<String, String> registerData) {
        Map<String, Object> response = new HashMap<>();
        
        String email = registerData.get("email");
        String nickname = registerData.get("nickname");
        String password = registerData.get("password");
        
        // 입력값 검증
        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "이메일을 입력해주세요.");
            return response;
        }
        
        if (nickname == null || nickname.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "아이디를 입력해주세요.");
            return response;
        }
        
        if (password == null || password.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "비밀번호를 입력해주세요.");
            return response;
        }
        
        try {
            // 이메일 중복 확인
            if (userService.existsByEmail(email.trim())) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 이메일입니다.");
                return response;
            }
            
            // 아이디(닉네임) 중복 확인
            Optional<User> existingNickname = userService.findByNickname(nickname.trim());
            if (existingNickname.isPresent()) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 아이디입니다.");
                return response;
            }
            
            // 사용자 생성
            User newUser = User.builder()
                    .email(email.trim())
                    .nickname(nickname.trim())
                    .password(password) // 실제로는 암호화해야 함
                    .build();
            
            userService.save(newUser);
            
            response.put("success", true);
            response.put("message", "회원가입이 완료되었습니다.");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "회원가입 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @GetMapping(value = "/diaries", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public List<Map<String, Object>> getDiaries(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return new ArrayList<>();
        }
        
        List<Diary> diaries = diaryService.findByUserId(userId);
        
        return diaries.stream().map(diary -> {
            Map<String, Object> diaryMap = new HashMap<>();
            diaryMap.put("id", diary.getDiaryId().toString());
            diaryMap.put("title", diary.getTitle());
            diaryMap.put("content", diary.getContent());
            diaryMap.put("date", diary.getDiaryDate().toString());
            // 작성 시간 추가 (createdAt)
            if (diary.getCreatedAt() != null) {
                diaryMap.put("createdAt", diary.getCreatedAt().toString());
            }
            
            // 감정 분석 결과 조회
            Optional<SentimentAnalysis> sentimentOpt = sentimentAnalysisService.findByDiaryId(diary.getDiaryId());
            if (sentimentOpt.isPresent()) {
                SentimentAnalysis sentiment = sentimentOpt.get();
                // Enum을 소문자 문자열로 변환 (프론트엔드와 호환)
                String emotionStr = sentiment.getEmotion().name().toLowerCase();
                diaryMap.put("emotion", emotionStr);
            }
            
            // 이미지 목록 조회
            List<DiaryImage> images = diaryImageService.findByDiaryId(diary.getDiaryId());
            List<String> imageUrls = images.stream()
                    .map(DiaryImage::getImageUrl)
                    .collect(Collectors.toList());
            diaryMap.put("images", imageUrls);
            
            return diaryMap;
        }).collect(Collectors.toList());
    }
    
    @GetMapping(value = "/diaries/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> getDiary(@PathVariable("id") String id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            Long diaryId = Long.parseLong(id);
            
            // 일기 조회 (User 엔티티 함께 로드)
            Diary diary = diaryService.findByIdWithUser(diaryId)
                    .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다."));
            
            // 소유자 확인
            if (diary.getUser() == null || !diary.getUser().getUserId().equals(userId)) {
                response.put("success", false);
                response.put("message", "권한이 없습니다.");
                return response;
            }
            
            // 일기 정보 구성
            Map<String, Object> diaryMap = new HashMap<>();
            diaryMap.put("id", diary.getDiaryId().toString());
            diaryMap.put("title", diary.getTitle());
            diaryMap.put("content", diary.getContent());
            diaryMap.put("date", diary.getDiaryDate().toString());
            // 작성 시간 추가 (createdAt)
            if (diary.getCreatedAt() != null) {
                diaryMap.put("createdAt", diary.getCreatedAt().toString());
            }
            
            // 감정 분석 결과 조회
            Optional<SentimentAnalysis> sentimentOpt = sentimentAnalysisService.findByDiaryId(diary.getDiaryId());
            if (sentimentOpt.isPresent()) {
                SentimentAnalysis sentiment = sentimentOpt.get();
                String emotionStr = sentiment.getEmotion().name().toLowerCase();
                diaryMap.put("emotion", emotionStr);
            }
            
            // 이미지 목록 조회
            List<DiaryImage> images = diaryImageService.findByDiaryId(diary.getDiaryId());
            List<String> imageUrls = images.stream()
                    .map(DiaryImage::getImageUrl)
                    .collect(Collectors.toList());
            diaryMap.put("images", imageUrls);
            
            response.put("success", true);
            response.put("diary", diaryMap);
            
        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("message", "잘못된 일기 ID입니다.");
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // 서버 로그에 출력
            response.put("success", false);
            response.put("message", "일기 조회에 실패했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @PostMapping(value = "/diaries", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> saveDiary(@RequestBody Map<String, Object> diaryData, 
                                         HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            // User 조회
            User user = userService.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            // Diary 엔티티 생성
            Diary diary = Diary.builder()
                    .user(user)
                    .title((String) diaryData.get("title"))
                    .content((String) diaryData.get("content"))
                    .diaryDate(LocalDate.parse((String) diaryData.get("date")))
                    .build();
            
            // Diary 저장
            Diary savedDiary = diaryService.save(diary);
            
            // 이미지 저장
            Object imageUrlsObj = diaryData.get("imageUrls");
            if (imageUrlsObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> rawList = (List<Object>) imageUrlsObj;
                
                List<DiaryImage> diaryImages = new ArrayList<>();
                for (int i = 0; i < rawList.size(); i++) {
                    Object item = rawList.get(i);
                    String imageUrl = item != null ? item.toString() : null;
                    
                    if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                        DiaryImage diaryImage = DiaryImage.builder()
                                .diary(savedDiary)
                                .imageUrl(imageUrl.trim())
                                .sortOrder(i + 1)
                                .build();
                        diaryImages.add(diaryImage);
                    }
                }
                
                if (!diaryImages.isEmpty()) {
                    diaryImageService.saveAll(diaryImages);
                }
            }
            
            // 감정 분석 결과 저장
            Object emotionObj = diaryData.get("emotion");
            if (emotionObj != null) {
                String emotionStr = emotionObj.toString().toUpperCase();
                
                try {
                    SentimentAnalysis.Emotion emotion = SentimentAnalysis.Emotion.valueOf(emotionStr);
                    SentimentAnalysis sentimentAnalysis = SentimentAnalysis.builder()
                            .diary(savedDiary)
                            .emotion(emotion)
                            .confidence(1.0f) // 기본 신뢰도
                            .build();
                    
                    sentimentAnalysisService.save(sentimentAnalysis);
                } catch (IllegalArgumentException e) {
                    // 유효하지 않은 감정 타입인 경우 무시
                }
            }
            
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "일기 저장에 실패했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @PutMapping(value = "/diaries/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> updateDiary(@PathVariable("id") String id,
                                           @RequestBody Map<String, Object> diaryData,
                                           HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            Long diaryId = Long.parseLong(id);
            
            // 일기 조회 및 소유자 확인 (User 엔티티 함께 로드)
            Diary diary = diaryService.findByIdWithUser(diaryId)
                    .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다."));
            
            if (diary.getUser() == null || !diary.getUser().getUserId().equals(userId)) {
                response.put("success", false);
                response.put("message", "권한이 없습니다.");
                return response;
            }
            
            // 수정할 데이터로 Diary 엔티티 생성
            Diary updatedDiary = Diary.builder()
                    .title((String) diaryData.get("title"))
                    .content((String) diaryData.get("content"))
                    .diaryDate(diaryData.get("date") != null 
                        ? LocalDate.parse((String) diaryData.get("date"))
                        : diary.getDiaryDate())
                    .build();
        
            // 일기 수정
            diaryService.update(diaryId, updatedDiary);
            
            // 이미지 업데이트 (기존 이미지 삭제 후 새로 저장)
            Object imageUrlsObj = diaryData.get("imageUrls");
            if (imageUrlsObj instanceof List) {
                // 기존 이미지 삭제
                diaryImageService.deleteByDiaryId(diaryId);
                
                // 새로운 이미지 저장
                @SuppressWarnings("unchecked")
                List<Object> rawList = (List<Object>) imageUrlsObj;
                
                List<DiaryImage> diaryImages = new ArrayList<>();
                for (int i = 0; i < rawList.size(); i++) {
                    Object item = rawList.get(i);
                    String imageUrl = item != null ? item.toString() : null;
                    
                    if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                        DiaryImage diaryImage = DiaryImage.builder()
                                .diary(diary)
                                .imageUrl(imageUrl.trim())
                                .sortOrder(i + 1)
                                .build();
                        diaryImages.add(diaryImage);
                    }
                }
                
                if (!diaryImages.isEmpty()) {
                    diaryImageService.saveAll(diaryImages);
                }
            }
            
            // 감정 분석 결과 업데이트
            Object emotionObj = diaryData.get("emotion");
            if (emotionObj != null) {
                String emotionStr = emotionObj.toString().toUpperCase();
                
                try {
                    SentimentAnalysis.Emotion emotion = SentimentAnalysis.Emotion.valueOf(emotionStr);
                    SentimentAnalysis sentimentAnalysis = SentimentAnalysis.builder()
                            .emotion(emotion)
                            .confidence(1.0f)
                            .build();
                    
                    // upsert로 감정 분석 결과 생성 또는 업데이트
                    sentimentAnalysisService.upsertByDiaryId(diaryId, sentimentAnalysis);
                } catch (IllegalArgumentException e) {
                    // 유효하지 않은 감정 타입인 경우 무시
                }
            }
        
        response.put("success", true);
        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("message", "잘못된 일기 ID입니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "일기 수정에 실패했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @DeleteMapping(value = "/diaries/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> deleteDiary(@PathVariable("id") String id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            Long diaryId = Long.parseLong(id);
            
            // 일기 조회 및 소유자 확인 (User 엔티티 함께 로드)
            Diary diary = diaryService.findByIdWithUser(diaryId)
                    .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다."));
            
            if (diary.getUser() == null || !diary.getUser().getUserId().equals(userId)) {
                response.put("success", false);
                response.put("message", "권한이 없습니다.");
                return response;
            }
            
            // 일기 삭제 (관련된 감정 분석, 이미지도 cascade로 삭제됨)
            diaryService.delete(diaryId);
            
            response.put("success", true);
        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("message", "잘못된 일기 ID입니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "일기 삭제에 실패했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @PostMapping(value = "/images/upload", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> uploadImages(@RequestParam("images") MultipartFile[] files,
                                           HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        // 로그인 확인
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            // 이미지 저장 디렉토리 경로 (프로젝트 루트 기준)
            String projectRoot = System.getProperty("user.dir");
            String uploadDir = projectRoot + File.separator + "src" + File.separator + "main" + 
                             File.separator + "resources" + File.separator + "static" + 
                             File.separator + "images" + File.separator + "data";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                if (!created && !directory.exists()) {
                    throw new IOException("이미지 저장 디렉토리를 생성할 수 없습니다: " + uploadDir);
                }
            }
            
            List<String> imageUrls = new ArrayList<>();
            
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }
                
                // 파일 확장자 확인
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null || !originalFilename.matches(".*\\.(jpg|jpeg|png|gif|webp)$")) {
                    continue;
                }
                
                // 고유한 파일명 생성 (타임스탬프 + 사용자ID + 원본 파일명)
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String uniqueFileName = System.currentTimeMillis() + "_" + userId + "_" + 
                                      UUID.randomUUID().toString().substring(0, 8) + fileExtension;
                
                // 파일 저장
                Path filePath = Paths.get(uploadDir, uniqueFileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                // 이미지 URL 생성 (프론트엔드에서 접근 가능한 경로)
                // Spring Boot 기본 static resource 경로 사용
                String imageUrl = "/images/data/" + uniqueFileName;
                imageUrls.add(imageUrl);
            }
            
            if (imageUrls.isEmpty()) {
                response.put("success", false);
                response.put("message", "업로드된 이미지가 없습니다.");
                return response;
            }
            
            response.put("success", true);
            response.put("imageUrls", imageUrls);
            response.put("message", imageUrls.size() + "개의 이미지가 업로드되었습니다.");
            
        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "이미지 업로드 중 오류가 발생했습니다: " + e.getMessage());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "이미지 업로드 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @GetMapping(value = "/user/info", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> getUserInfo(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            User user = userService.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            // 사용자 정보
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userId", user.getUserId());
            userInfo.put("email", user.getEmail());
            userInfo.put("nickname", user.getNickname());
            userInfo.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
            
            // 일기 통계
            List<Diary> diaries = diaryService.findByUserId(userId);
            userInfo.put("totalDiaries", diaries.size());
            
            response.put("success", true);
            response.put("user", userInfo);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 정보 조회에 실패했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @PutMapping(value = "/user/info", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> updateUserInfo(@RequestBody Map<String, String> userData,
                                               HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            User user = userService.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            // 이메일 변경
            String email = userData.get("email");
            if (email != null && !email.trim().isEmpty()) {
                String emailTrimmed = email.trim();
                // 현재 이메일과 다를 때만 중복 확인
                if (!emailTrimmed.equals(user.getEmail())) {
                    if (userService.existsByEmail(emailTrimmed)) {
                        response.put("success", false);
                        response.put("message", "이미 사용 중인 이메일입니다.");
                        return response;
                    }
                    user.setEmail(emailTrimmed);
                }
            }
            
            // 닉네임 변경
            String nickname = userData.get("nickname");
            if (nickname != null && !nickname.trim().isEmpty()) {
                String nicknameTrimmed = nickname.trim();
                // 현재 닉네임과 다를 때만 중복 확인
                if (!nicknameTrimmed.equals(user.getNickname())) {
                    Optional<User> existingUser = userService.findByNickname(nicknameTrimmed);
                    if (existingUser.isPresent() && !existingUser.get().getUserId().equals(userId)) {
                        response.put("success", false);
                        response.put("message", "이미 사용 중인 닉네임입니다.");
                        return response;
                    }
                    user.setNickname(nicknameTrimmed);
                    // 세션의 username도 업데이트
                    session.setAttribute("username", nicknameTrimmed);
                }
            }
            
            // 비밀번호 변경
            String password = userData.get("password");
            String newPassword = userData.get("newPassword");
            if (password != null && newPassword != null && !newPassword.trim().isEmpty()) {
                // 현재 비밀번호 확인
                if (!password.equals(user.getPassword())) {
                    response.put("success", false);
                    response.put("message", "현재 비밀번호가 올바르지 않습니다.");
                    return response;
                }
                user.setPassword(newPassword.trim());
            }
            
            userService.save(user);
            
            response.put("success", true);
            response.put("message", "사용자 정보가 수정되었습니다.");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 정보 수정에 실패했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @PostMapping(value = "/user/verify-password", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> verifyPassword(@RequestBody Map<String, String> passwordData,
                                               HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            User user = userService.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            String password = passwordData.get("password");
            if (password == null || password.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "비밀번호를 입력해주세요.");
                return response;
            }
            
            if (password.equals(user.getPassword())) {
                response.put("success", true);
                response.put("message", "비밀번호가 확인되었습니다.");
            } else {
                response.put("success", false);
                response.put("message", "비밀번호가 일치하지 않습니다.");
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "비밀번호 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @PostMapping(value = "/analyze-emotion", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> analyzeEmotion(@RequestBody Map<String, String> request,
                                               HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        // 로그인 확인
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            String text = request.get("text");
            if (text == null || text.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "분석할 텍스트를 입력해주세요.");
                return response;
            }
            
            // 감정 분석 수행
            SentimentAnalysis.Emotion emotion = emotionAnalysisService.analyzeEmotion(text);
            
            response.put("success", true);
            response.put("emotion", emotion.name().toLowerCase());
            response.put("message", "감정 분석이 완료되었습니다.");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "감정 분석 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return response;
    }
    
    @DeleteMapping(value = "/user/delete", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> deleteUser(@RequestBody Map<String, String> deleteData,
                                           HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        try {
            User user = userService.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            // 비밀번호 확인
            String password = deleteData.get("password");
            if (password == null || !password.equals(user.getPassword())) {
                response.put("success", false);
                response.put("message", "비밀번호가 올바르지 않습니다.");
                return response;
            }
            
            // 사용자의 모든 일기 삭제 (cascade로 자동 삭제되지만 명시적으로 처리)
            List<Diary> diaries = diaryService.findByUserId(userId);
            for (Diary diary : diaries) {
                diaryService.delete(diary.getDiaryId());
            }
            
            // 사용자 삭제
            userService.delete(userId);
            
            // 세션 무효화
            session.invalidate();
            
            response.put("success", true);
            response.put("message", "탈퇴가 완료되었습니다.");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "탈퇴 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return response;
    }
}

