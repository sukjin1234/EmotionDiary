<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%
    String currentPage = (String) request.getAttribute("currentPage");
    if (currentPage == null) {
        String uri = request.getRequestURI();
        if (uri.contains("/main")) currentPage = "main";
        else if (uri.contains("/write")) currentPage = "write";
        else if (uri.contains("/calendar")) currentPage = "calendar";
        else currentPage = "main";
    }
    String username = (String) session.getAttribute("username");
    
    // 수정 모드 확인 (write 페이지이고 id 파라미터가 있을 때)
    boolean isEditMode = "write".equals(currentPage) && request.getParameter("id") != null;
%>
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-header">
            <h1 class="nav-title">감정일기</h1>
            
            <div class="nav-desktop">
                <a href="${pageContext.request.contextPath}/main" 
                   class="nav-link <%= "main".equals(currentPage) ? "active" : "" %>">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>홈</span>
                </a>
                
                <a href="${pageContext.request.contextPath}/write" 
                   class="nav-link <%= "write".equals(currentPage) ? "active" : "" %>">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span><%= isEditMode ? "일기 수정" : "일기 쓰기" %></span>
                </a>
                
                <a href="${pageContext.request.contextPath}/calendar" 
                   class="nav-link <%= "calendar".equals(currentPage) ? "active" : "" %>">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>통계 캘린더</span>
                </a>
            </div>
            
            <div class="nav-user">
                <div class="user-info">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span><%= username != null ? username : "사용자" %></span>
                </div>
                <button class="btn-logout" onclick="logout()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>로그아웃</span>
                </button>
            </div>

            <button class="nav-menu-toggle" id="menuToggle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="menuIcon">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="closeIcon" style="display: none;">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <div class="nav-mobile" id="mobileMenu" style="display: none;">
            <a href="${pageContext.request.contextPath}/main" 
               class="nav-link <%= "main".equals(currentPage) ? "active" : "" %>">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>홈</span>
            </a>
            
            <a href="${pageContext.request.contextPath}/write" 
               class="nav-link <%= "write".equals(currentPage) ? "active" : "" %>">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span><%= isEditMode ? "일기 수정" : "일기 쓰기" %></span>
            </a>
            
            <a href="${pageContext.request.contextPath}/calendar" 
               class="nav-link <%= "calendar".equals(currentPage) ? "active" : "" %>">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>통계 캘린더</span>
            </a>

            <div class="nav-user-mobile">
                <div class="user-info">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span><%= username != null ? username : "사용자" %></span>
                </div>
                <button class="btn-logout" onclick="logout()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>로그아웃</span>
                </button>
            </div>
        </div>
    </div>
</nav>

<script>
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        fetch('${pageContext.request.contextPath}/api/logout', {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            location.href = '${pageContext.request.contextPath}/login';
        });
    }
}

document.getElementById('menuToggle')?.addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');
    
    if (mobileMenu.style.display === 'none') {
        mobileMenu.style.display = 'block';
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
    } else {
        mobileMenu.style.display = 'none';
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    }
});
</script>

