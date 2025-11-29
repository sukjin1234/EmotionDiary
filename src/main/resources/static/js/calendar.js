const emotionIcons = {
    happy: '😊',
    angry: '😠',
    sad: '😢'
};

const emotionLabels = {
    happy: '행복',
    angry: '분노',
    sad: '슬픔'
};

const emotionColors = {
    happy: '#facc15',
    angry: '#f87171',
    sad: '#60a5fa'
};

let currentDate = new Date();
let diaries = [];

async function loadDiaries() {
    try {
        const response = await fetch('/api/diaries', {
            credentials: 'include'
        });
        
        if (response.ok) {
            diaries = await response.json();
            renderCalendar();
            renderMonthlyStats();
        }
    } catch (error) {
        console.error('Error loading diaries:', error);
    }
}

function renderMonthlyStats() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthlyDiaries = diaries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });
    
    const stats = monthlyDiaries.reduce((acc, entry) => {
        acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
        return acc;
    }, {});
    
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    const statsContainer = document.getElementById('monthlyStats');
    statsContainer.innerHTML = `
        <h2>이번 달 감정 분포</h2>
        <div class="stats-grid">
            ${Object.entries(emotionLabels).map(([emotion, label]) => {
                const count = stats[emotion] || 0;
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                return `
                    <div class="stat-item">
                        <div class="stat-icon">${emotionIcons[emotion]}</div>
                        <p class="stat-label">${label}</p>
                        <p class="stat-count">${count}개</p>
                        <p class="stat-percentage">(${percentage}%)</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('calendarTitle').textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    
    let calendarHTML = '';
    
    ['일', '월', '화', '수', '목', '금', '토'].forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const emotion = getEmotionForDate(dateStr);
        const isToday = isCurrentMonth && today.getDate() === day;
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${emotion ? 'has-emotion' : ''}">
                <span class="calendar-day-number ${isToday ? 'today' : ''}">${day}</span>
                ${emotion ? `
                    <div class="emotion-indicator ${emotion}">
                        ${emotionIcons[emotion]}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    document.getElementById('calendarGrid').innerHTML = calendarHTML;
    
    const legendHTML = Object.entries(emotionLabels).map(([emotion, label]) => `
        <div class="legend-item">
            <div class="legend-icon ${emotion}">
                ${emotionIcons[emotion]}
            </div>
            <span class="legend-label">${label}</span>
        </div>
    `).join('');
    
    document.getElementById('calendarLegend').innerHTML = legendHTML;
}

function getEmotionForDate(dateStr) {
    const entry = diaries.find(e => {
        const entryDate = e.date.split('T')[0];
        return entryDate === dateStr;
    });
    return entry ? entry.emotion : null;
}

document.getElementById('prevMonth').addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    renderMonthlyStats();
});

document.getElementById('nextMonth').addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    renderMonthlyStats();
});

loadDiaries();

