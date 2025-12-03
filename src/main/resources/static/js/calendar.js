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
let selectedDate = null;
let expandedDiaryId = null;

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
        const entries = getEntriesForDate(dateStr);
        const hasEntries = entries.length > 0;
        const clickableClass = hasEntries ? 'clickable' : '';
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${emotion ? 'has-emotion' : ''} ${clickableClass}" 
                 data-date="${dateStr}" data-day="${day}">
                <span class="calendar-day-number ${isToday ? 'today' : ''}">${day}</span>
                ${emotion ? `
                    <div class="emotion-indicator ${emotion}">
                        ${emotionIcons[emotion]}
                    </div>
                ` : ''}
                ${hasEntries && entries.length > 1 ? `
                    <span class="diary-count">${entries.length}</span>
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
    if (!dateStr || !diaries || diaries.length === 0) {
        return null;
    }
    
    const entry = diaries.find(e => {
        if (!e.date) return false;
        let entryDate = e.date;
        if (entryDate.includes('T')) {
            entryDate = entryDate.split('T')[0];
        }
        if (entryDate.includes(' ')) {
            entryDate = entryDate.split(' ')[0];
        }
        return entryDate === dateStr;
    });
    return entry ? entry.emotion : null;
}

function getEntriesForDate(dateStr) {
    if (!dateStr || !diaries || diaries.length === 0) {
        return [];
    }
    
    return diaries.filter(e => {
        if (!e.date) return false;
        let entryDate = e.date;
        if (entryDate.includes('T')) {
            entryDate = entryDate.split('T')[0];
        }
        if (entryDate.includes(' ')) {
            entryDate = entryDate.split(' ')[0];
        }
        return entryDate === dateStr;
    });
}

function handleDateClick(day) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entries = getEntriesForDate(dateStr);
    
    if (entries.length > 0) {
        selectedDate = dateStr;
        expandedDiaryId = null;
        showDiaryModal(dateStr, entries);
    }
}

function showDiaryModal(dateStr, entries) {
    const modal = document.getElementById('diaryModal');
    const modalTitle = document.getElementById('diaryModalTitle');
    const modalSubtitle = document.getElementById('diaryModalSubtitle');
    const diaryList = document.getElementById('diaryList');
    
    if (!modal || !modalTitle || !modalSubtitle || !diaryList) {
        return;
    }
    
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    modalTitle.textContent = formattedDate;
    modalSubtitle.textContent = `총 ${entries.length}개의 일기`;
    
    diaryList.innerHTML = entries.map(entry => {
        let timeStr = '';
        if (entry.date) {
            const diaryDate = new Date(entry.date);
            if (!isNaN(diaryDate.getTime())) {
                timeStr = diaryDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
            }
        }
        
        const isExpanded = expandedDiaryId === entry.id;
        const config = {
            happy: { bgColor: 'rgba(250, 204, 21, 0.2)', color: '#92400e', borderColor: '#facc15' },
            angry: { bgColor: 'rgba(248, 113, 113, 0.2)', color: '#991b1b', borderColor: '#f87171' },
            sad: { bgColor: 'rgba(96, 165, 250, 0.2)', color: '#1e40af', borderColor: '#60a5fa' }
        }[entry.emotion] || { bgColor: 'rgba(250, 204, 21, 0.2)', color: '#92400e', borderColor: '#facc15' };
        
        return `
            <div class="diary-item" data-diary-id="${entry.id}" style="border-left: 4px solid ${config.borderColor}; background: ${config.bgColor};">
                <button class="diary-item-btn" data-diary-id="${entry.id}">
                    <div class="diary-item-header">
                        <div class="diary-emotion" style="background: ${config.bgColor}; color: ${config.color}; border: 1px solid ${config.borderColor};">
                            <span class="emotion-icon">${emotionIcons[entry.emotion] || emotionIcons.happy}</span>
                            <span class="emotion-label">${emotionLabels[entry.emotion] || '감정 없음'}</span>
                        </div>
                        <div class="diary-header-right">
                            ${timeStr ? `<span class="diary-time">${timeStr}</span>` : ''}
                            <svg class="diary-expand-icon ${isExpanded ? 'expanded' : ''}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    </div>
                    <h4 class="diary-title">${escapeHtml(entry.title || '제목 없음')}</h4>
                </button>
                ${isExpanded ? `
                    <div class="diary-content-expanded">
                        <p class="diary-content">${entry.content ? escapeHtml(entry.content).replace(/\n/g, '<br>') : '내용 없음'}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    attachDiaryItemClickHandlers();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function attachDiaryItemClickHandlers() {
    document.querySelectorAll('.diary-item-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const diaryId = this.dataset.diaryId;
            if (expandedDiaryId === diaryId) {
                expandedDiaryId = null;
            } else {
                expandedDiaryId = diaryId;
            }
            
            if (selectedDate) {
                const entries = getEntriesForDate(selectedDate);
                showDiaryModal(selectedDate, entries);
            }
        });
    });
}

function closeDiaryModal() {
    const modal = document.getElementById('diaryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        selectedDate = null;
        expandedDiaryId = null;
    }
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

document.addEventListener('DOMContentLoaded', function() {
    const calendarGrid = document.getElementById('calendarGrid');
    const modalClose = document.getElementById('diaryModalClose');
    const modalOverlay = document.getElementById('diaryModalOverlay');
    
    if (calendarGrid) {
        calendarGrid.addEventListener('click', function(e) {
            const dayElement = e.target.closest('.calendar-day[data-date]');
            if (!dayElement) return;
            
            const day = parseInt(dayElement.dataset.day);
            if (day) {
                handleDateClick(day);
            }
        });
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeDiaryModal();
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
            closeDiaryModal();
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('diaryModal');
            if (modal && modal.style.display === 'flex') {
                closeDiaryModal();
            }
        }
    });
    
    loadDiaries();
});

