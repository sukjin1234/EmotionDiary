package com.example.emotiondiary.controller;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@RequestMapping("/api")
public class ApiController {
    
    private static final Map<String, List<Map<String, Object>>> userDiaries = new ConcurrentHashMap<>();
    
    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> login(@RequestBody Map<String, String> loginData, 
                                     HttpSession session) {
        String userId = loginData.get("userId");
        String password = loginData.get("password");
        
        Map<String, Object> response = new HashMap<>();
        
        if (userId != null && !userId.trim().isEmpty() && 
            password != null && !password.trim().isEmpty()) {
            session.setAttribute("username", userId.trim());
            response.put("success", true);
        } else {
            response.put("success", false);
            response.put("message", "아이디와 비밀번호를 입력해주세요.");
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
    
    @GetMapping(value = "/diaries", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public List<Map<String, Object>> getDiaries(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return new ArrayList<>();
        }
        
        return userDiaries.getOrDefault(username, new ArrayList<>());
    }
    
    @PostMapping(value = "/diaries", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> saveDiary(@RequestBody Map<String, Object> diaryData, 
                                         HttpSession session) {
        String username = (String) session.getAttribute("username");
        Map<String, Object> response = new HashMap<>();
        
        if (username == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        Map<String, Object> diary = new HashMap<>();
        diary.put("id", UUID.randomUUID().toString());
        diary.put("title", diaryData.get("title"));
        diary.put("content", diaryData.get("content"));
        diary.put("emotion", diaryData.get("emotion"));
        diary.put("date", diaryData.get("date"));
        
        userDiaries.computeIfAbsent(username, k -> new ArrayList<>()).add(diary);
        
        response.put("success", true);
        return response;
    }
    
    @DeleteMapping(value = "/diaries/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> deleteDiary(@PathVariable String id, HttpSession session) {
        String username = (String) session.getAttribute("username");
        Map<String, Object> response = new HashMap<>();
        
        if (username == null) {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }
        
        List<Map<String, Object>> diaries = userDiaries.get(username);
        if (diaries != null) {
            diaries.removeIf(diary -> id.equals(diary.get("id")));
            response.put("success", true);
        } else {
            response.put("success", false);
        }
        
        return response;
    }
}

