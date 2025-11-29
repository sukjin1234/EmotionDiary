<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>감정일기 - 일기 쓰기</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/common.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/write.css">
</head>
<body>
    <jsp:include page="/WEB-INF/views/views/navigation.jsp"/>
    
    <div class="container">
        <div class="write-content">
            <div class="write-card">
                <div class="write-header">
                    <h1>새 일기 쓰기</h1>
                    <button class="btn-close" onclick="location.href='${pageContext.request.contextPath}/main'">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form id="diaryForm" class="diary-form">
                    <div class="form-group">
                        <label for="title">제목</label>
                        <input type="text" id="title" name="title" placeholder="오늘의 일기 제목을 입력하세요">
                    </div>

                    <div class="form-group">
                        <label for="content">내용</label>
                        <textarea id="content" name="content" rows="12" placeholder="오늘 하루는 어땠나요? 당신의 이야기를 들려주세요..."></textarea>
                    </div>

                    <button type="button" id="analyzeBtn" class="btn-analyze">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                        </svg>
                        <span>감정 분석하기</span>
                    </button>

                    <div id="emotionResult" class="emotion-result" style="display: none;">
                        <p class="result-label">분석된 감정</p>
                        <p class="result-emotion" id="resultEmotion"></p>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="location.href='${pageContext.request.contextPath}/main'">취소</button>
                        <button type="submit" class="btn-save">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            <span>저장하기</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <script src="${pageContext.request.contextPath}/resources/js/write.js"></script>
</body>
</html>

