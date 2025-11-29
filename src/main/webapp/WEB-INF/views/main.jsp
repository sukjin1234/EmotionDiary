<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>감정일기 - 홈</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/common.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/main.css">
</head>
<body>
    <jsp:include page="/WEB-INF/views/views/navigation.jsp"/>
    
    <div class="container">
        <div class="main-content">
            <div class="page-header">
                <h1>나의 감정 일기</h1>
                <p>당신의 감정을 확인하세요</p>
            </div>

            <div class="emotion-stats" id="emotionStats">
            </div>

            <button class="btn-new-diary" onclick="location.href='${pageContext.request.contextPath}/write'">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>새 일기 쓰기</span>
            </button>

            <div class="diary-list-section">
                <h2>최근 일기</h2>
                <div id="diaryList" class="diary-list">
                </div>
            </div>
        </div>
    </div>
    
    <script src="${pageContext.request.contextPath}/resources/js/main.js"></script>
</body>
</html>

