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
    <jsp:include page="/WEB-INF/views/navigation.jsp"/>
    
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
    
    <!-- 일기 상세 모달 -->
    <div id="diaryModal" class="diary-modal">
        <div class="diary-modal-overlay" id="diaryModalOverlay"></div>
        <div class="diary-modal-content">
            <div class="diary-modal-header">
                <div class="diary-modal-header-left">
                    <h3 id="diaryModalTitle">일기 상세</h3>
                    <div class="diary-modal-subtitle-container">
                        <p id="diaryModalSubtitle" class="diary-modal-subtitle"></p>
                        <div id="diaryModalEmotionBadge" class="diary-modal-emotion-badge"></div>
                    </div>
                </div>
                <button class="diary-modal-close" id="diaryModalClose">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="diary-modal-body">
                <div id="diaryModalContent" class="diary-modal-detail">
                </div>
            </div>
            <div class="diary-modal-footer">
                <button class="btn-modal-edit" id="diaryModalEditBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>수정</span>
                </button>
            </div>
        </div>
    </div>
    
    <script>
        const CONTEXT_PATH_JSP = "${pageContext.request.contextPath}";
    </script>
    <script src="${pageContext.request.contextPath}/resources/js/main.js"></script>
</body>
</html>

