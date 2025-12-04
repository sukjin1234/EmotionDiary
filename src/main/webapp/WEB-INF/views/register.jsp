<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>감정일기 - 회원가입</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/common.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/register.css">
</head>
<body class="register-page">
    <div class="register-container">
        <div class="register-card">
            <div class="register-header">
                <div class="register-icons">
                    <svg class="icon-book" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    <svg class="icon-heart" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </div>
                <h1>회원가입</h1>
                <p>감정일기와 함께 시작하세요</p>
            </div>

            <form id="registerForm" class="register-form">

                <div class="form-group">
                    <label for="nickname">아이디</label>
                    <input type="text" id="nickname" name="nickname" placeholder="아이디를 입력하세요" required>
                    <span class="error-message" id="nicknameError"></span>
                </div>

                <div class="form-group">
                    <label for="password">비밀번호</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="password" name="password" placeholder="비밀번호를 입력하세요" required>
                        <button type="button" class="password-toggle" id="passwordToggle" aria-label="비밀번호 보기/숨기기">
                            <svg class="eye-icon eye-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                            <svg class="eye-icon eye-open" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                    <span class="error-message" id="passwordError"></span>
                </div>

                <div class="form-group">
                    <label for="email">이메일</label>
                    <input type="email" id="email" name="email" placeholder="이메일을 입력하세요" required>
                    <span class="error-message" id="emailError"></span>
                </div>

                <button type="submit" class="btn-register">회원가입</button>
            </form>

            <div class="login-link">
                <a href="/login">이미 계정이 있으신가요? 로그인</a>
            </div>

            <div class="register-footer">
                <p>회원가입을 통해</p>
                <p>나만의 감정 일기를 시작하세요</p>
            </div>
        </div>
    </div>
    
    <script src="${pageContext.request.contextPath}/resources/js/register.js"></script>
</body>
</html>

