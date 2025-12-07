<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>감정일기 - 사용자 정보</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/common.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/userinfo.css">
</head>
<body>
    <jsp:include page="/WEB-INF/views/navigation.jsp"/>
    
    <div class="container">
        <div class="userinfo-content">
            <div class="userinfo-card">
                <div class="userinfo-header">
                    <div class="userinfo-header-left">
                        <h1>사용자 정보</h1>
                        <p class="userinfo-subtitle">계정 정보를 관리하세요</p>
                    </div>
                    <button class="btn-close" onclick="location.href='${pageContext.request.contextPath}/main'">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="userinfo-body">
                    <div class="user-stats">
                        <div class="stat-item">
                            <div class="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <div class="stat-info">
                                <p class="stat-label">작성한 일기</p>
                                <p class="stat-value" id="totalDiaries">0</p>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <div class="stat-info">
                                <p class="stat-label">가입일</p>
                                <p class="stat-value" id="createdAt">-</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="nickname">아이디</label>
                        <input type="text" id="nickname" name="nickname" placeholder="아이디를 입력하세요" required>
                        <p class="form-help">로그인 시 사용되는 아이디입니다.</p>
                    </div>

                    <form id="userInfoForm" class="userinfo-form">
                        <div class="form-group">
                            <label for="email">이메일</label>
                            <input type="email" id="email" name="email" placeholder="이메일을 입력하세요" required>
                            <p class="form-help">로그인 시 이메일 또는 아이디디를 사용할 수 있습니다.</p>
                        </div>


                        <div class="form-section">
                            <h3>비밀번호 변경</h3>
                            <p class="section-description">비밀번호를 변경하려면 현재 비밀번호와 새 비밀번호를 입력하세요.</p>
                            
                            <div class="form-group">
                                <label for="password">현재 비밀번호</label>
                                <div class="password-input-group">
                                    <input type="password" id="password" name="password" placeholder="현재 비밀번호를 입력하세요">
                                    <button type="button" class="btn-verify-password" id="verifyPasswordBtn" onclick="verifyPassword()">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                        <span>확인</span>
                                    </button>
                                </div>
                                <p class="form-help" id="passwordVerifyMessage"></p>
                            </div>

                            <div class="form-group">
                                <label for="newPassword">새 비밀번호</label>
                                <input type="password" id="newPassword" name="newPassword" placeholder="새 비밀번호를 입력하세요">
                                <p class="form-help">비밀번호를 변경하지 않으려면 비워두세요.</p>
                            </div>
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

                    <div class="delete-section">
                        <div class="delete-section-header">
                            <h3>계정 삭제</h3>
                            <p class="section-description">계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.</p>
                        </div>
                        <button type="button" class="btn-delete-account" onclick="handleDeleteAccount()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span>탈퇴하기</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const CONTEXT_PATH_JSP = "${pageContext.request.contextPath}";
    </script>
    <script src="${pageContext.request.contextPath}/resources/js/userinfo.js"></script>
</body>
</html>

