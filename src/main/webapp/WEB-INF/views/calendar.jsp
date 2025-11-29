<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>감정일기 - 통계 캘린더</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/common.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/calendar.css">
</head>
<body>
    <jsp:include page="/WEB-INF/views/navigation.jsp"/>
    
    <div class="container">
        <div class="calendar-content">
            <div class="page-header">
                <h1>감정 통계 캘린더</h1>
                <p>한 달간의 감정 변화를 한눈에 확인하세요</p>
            </div>

            <div class="monthly-stats" id="monthlyStats">
            </div>

            <div class="calendar-card">
                <div class="calendar-header">
                    <button class="btn-prev-month" id="prevMonth">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    
                    <h2 id="calendarTitle"></h2>
                    
                    <button class="btn-next-month" id="nextMonth">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                <div class="calendar-grid" id="calendarGrid">
                </div>

                <div class="calendar-legend" id="calendarLegend">
                </div>
            </div>
        </div>
    </div>
    
    <script src="${pageContext.request.contextPath}/resources/js/calendar.js"></script>
</body>
</html>

