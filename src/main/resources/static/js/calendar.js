const CONTEXT_PATH = typeof CONTEXT_PATH_JSP !== 'undefined' ? CONTEXT_PATH_JSP : '';

const emotionConfig = {
    happy: {
        icon: `${CONTEXT_PATH}/images/icon/happy.png`,
        label: '기쁨',
        color: '#facc15',
        bgColor: '#fef9c3',
        borderColor: '#fde047'
    },
    anxiety: {
        icon: `${CONTEXT_PATH}/images/icon/anxiety.png`,
        label: '불안',
        color: '#a855f7',
        bgColor: '#f3e8ff',
        borderColor: '#c4b5fd'
    },
    embarrassed: {
        icon: `${CONTEXT_PATH}/images/icon/embarrassed.png`,
        label: '당황',
        color: '#16a34a',
        bgColor: '#dcfce7',
        borderColor: '#86efac'
    },
    sad: {
        icon: `${CONTEXT_PATH}/images/icon/sad.png`,
        label: '슬픔',
        color: '#60a5fa',
        bgColor: '#dbeafe',
        borderColor: '#93c5fd'
    },
    angry: {
        icon: `${CONTEXT_PATH}/images/icon/angry.png`,
        label: '분노',
        color: '#f87171',
        bgColor: '#fee2e2',
        borderColor: '#fca5a5'
    },
    hurt: {
        icon: `${CONTEXT_PATH}/images/icon/hurt.png`,
        label: '상처',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        borderColor: '#9ca3af'
    }
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

// 이미지 URL 정규화 함수 (기존 /resources/images/ 경로를 /images/로 변환)
function normalizeImageUrl(imageUrl) {
    if (!imageUrl) return '';
    // /resources/images/ 경로를 /images/로 변환
    if (imageUrl.startsWith('/resources/images/')) {
        return imageUrl.replace('/resources/images/', '/images/');
    }
    // 이미 /images/로 시작하거나 상대 경로인 경우 그대로 반환
    return imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
}

async function loadDiaries() {
    try {
        const response = await fetch(`${CONTEXT_PATH}/api/diaries`, {
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

let pieChart = null;

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
    
    // 파이 차트 데이터 준비
    const chartData = [];
    const chartLabels = [];
    const chartColors = [];
    const chartEmotions = [];
    
    Object.entries(emotionConfig).forEach(([emotion, config]) => {
        const count = stats[emotion] || 0;
        if (count > 0) {
            chartData.push(count);
            chartLabels.push(config.label);
            chartColors.push(config.bgColor);
            chartEmotions.push(emotion);
        }
    });
    
    // HTML 생성 (항상 새로 생성)
    statsContainer.innerHTML = `
        <h2>이번 달 감정 분포</h2>
        <div class="pie-chart-wrapper">
            <div class="pie-chart-container">
                <canvas id="emotionPieChart"></canvas>
                <div id="pieChartEmojis" class="pie-chart-emojis"></div>
            </div>
        </div>
    `;
    
    // 기존 차트가 있으면 제거
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
    
    // 파이 차트 렌더링
    const ctx = document.getElementById('emotionPieChart');
    const emojisContainer = document.getElementById('pieChartEmojis');
    
    if (ctx && total > 0) {
        pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 0 // 애니메이션 비활성화로 즉시 렌더링
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value}개 (${percentage}%)`;
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'emotionEmojis',
                afterDraw: (chart) => {
                    placeEmojisOnChart(chart, chartData, chartEmotions, total, emojisContainer, stats);
                },
                afterUpdate: (chart) => {
                    placeEmojisOnChart(chart, chartData, chartEmotions, total, emojisContainer, stats);
                }
            }]
        });
        
        // 차트가 리사이즈될 때도 이모지 위치 업데이트
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                if (pieChart) {
                    setTimeout(() => {
                        placeEmojisOnChart(pieChart, chartData, chartEmotions, total, emojisContainer, stats);
                    }, 50);
                }
            });
            resizeObserver.observe(ctx.parentElement);
        }
    } else if (ctx) {
        // 데이터가 없을 때
        const ctx2d = ctx.getContext('2d');
        ctx2d.clearRect(0, 0, ctx.width, ctx.height);
        ctx2d.font = '16px Arial';
        ctx2d.fillStyle = '#6b7280';
        ctx2d.textAlign = 'center';
        ctx2d.textBaseline = 'middle';
        ctx2d.fillText('이번 달 일기가 없습니다', ctx.width / 2, ctx.height / 2);
    }
}

function placeEmojisOnChart(chart, chartData, chartEmotions, total, container, stats) {
    if (!container || !chart) return;
    
    const chartArea = chart.chartArea;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const radius = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) / 2;
    const emojiRadius = radius * 0.65;
    
    container.innerHTML = '';
    container.style.width = chartArea.right - chartArea.left + 'px';
    container.style.height = chartArea.bottom - chartArea.top + 'px';
    container.style.left = chartArea.left + 'px';
    container.style.top = chartArea.top + 'px';
    
    let currentAngle = -Math.PI / 2; // 시작 각도 (12시 방향)
    
    chartData.forEach((value, index) => {
        const percentage = value / total;
        const angle = percentage * 2 * Math.PI;
        const midAngle = currentAngle + angle / 2;
        
        const emojiX = Math.cos(midAngle) * emojiRadius;
        const emojiY = Math.sin(midAngle) * emojiRadius;
        
        const emotion = chartEmotions[index];
        const config = emotionConfig[emotion];
        const count = stats[emotion] || value;
        const percent = ((count / total) * 100).toFixed(1);
        
        // 이모지와 텍스트를 담을 컨테이너
        const emojiElement = document.createElement('div');
        emojiElement.className = 'pie-chart-emoji';
        emojiElement.style.position = 'absolute';
        emojiElement.style.left = `calc(50% + ${emojiX}px)`;
        emojiElement.style.top = `calc(50% + ${emojiY}px)`;
        emojiElement.style.transform = 'translate(-50%, -50%)';
        emojiElement.style.display = 'flex';
        emojiElement.style.flexDirection = 'column';
        emojiElement.style.alignItems = 'center';
        emojiElement.style.justifyContent = 'center';
        emojiElement.style.gap = '0.25rem';
        
        // 이모지 이미지
        const imgWrapper = document.createElement('div');
        imgWrapper.style.width = '48px';
        imgWrapper.style.height = '48px';
        imgWrapper.style.display = 'flex';
        imgWrapper.style.alignItems = 'center';
        imgWrapper.style.justifyContent = 'center';
        
        const img = document.createElement('img');
        img.src = config.icon;
        img.alt = config.label;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        imgWrapper.appendChild(img);
        
        // 텍스트 정보
        const textWrapper = document.createElement('div');
        textWrapper.style.textAlign = 'center';
        textWrapper.style.display = 'flex';
        textWrapper.style.flexDirection = 'column';
        textWrapper.style.alignItems = 'center';
        textWrapper.style.gap = '0.125rem';
        
        const countText = document.createElement('span');
        countText.textContent = `${count}개`;
        countText.style.fontSize = '0.75rem';
        countText.style.fontWeight = '600';
        countText.style.color = '#374151';
        
        const percentText = document.createElement('span');
        percentText.textContent = `(${percent}%)`;
        percentText.style.fontSize = '0.625rem';
        percentText.style.color = '#6b7280';
        
        textWrapper.appendChild(countText);
        textWrapper.appendChild(percentText);
        
        emojiElement.appendChild(imgWrapper);
        emojiElement.appendChild(textWrapper);
        container.appendChild(emojiElement);
        
        currentAngle += angle;
    });
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
            <div class="calendar-day ${isToday ? 'today' : ''} ${emotion ? 'has-emotion ' + emotion : ''} ${clickableClass}" 
                 data-date="${dateStr}" data-day="${day}">
                <span class="calendar-day-number ${isToday ? 'today' : ''}">${day}</span>
                ${emotion ? `
                    <div class="emotion-indicator ${emotion}">
                        <img src="${emotionConfig[emotion]?.icon || emotionConfig.happy.icon}" alt="${emotionConfig[emotion]?.label || '감정'}" />
                    </div>
                ` : ''}
                ${hasEntries && entries.length > 1 ? `
                    <span class="diary-count">${entries.length}</span>
                ` : ''}
            </div>
        `;
    }
    
    document.getElementById('calendarGrid').innerHTML = calendarHTML;
    
    const legendHTML = Object.entries(emotionConfig).map(([emotion, config]) => `
        <div class="legend-item">
            <div class="legend-icon ${emotion}">
                <img src="${config.icon}" alt="${config.label}" />
            </div>
            <span class="legend-label">${config.label}</span>
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
        // createdAt이 있으면 작성 시간을 사용, 없으면 date에서 시간 추출
        if (entry.createdAt) {
            const createdAtDate = new Date(entry.createdAt);
            if (!isNaN(createdAtDate.getTime())) {
                timeStr = createdAtDate.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
            }
        } else if (entry.date) {
            const diaryDate = new Date(entry.date);
            if (!isNaN(diaryDate.getTime())) {
                timeStr = diaryDate.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
            }
        }
        
        const isExpanded = expandedDiaryId === entry.id;
        const config = emotionConfig[entry.emotion] || emotionConfig.happy;
        
        return `
            <div class="diary-item" data-diary-id="${entry.id}" style="border-left: 4px solid ${config.borderColor}; background: ${config.bgColor};">
                <button class="diary-item-btn" data-diary-id="${entry.id}">
                    <div class="diary-item-header">
                        <div class="diary-emotion" style="background: ${config.bgColor}; color: ${config.color}; border: 1px solid ${config.borderColor};">
                            <span class="emotion-icon"><img src="${config.icon}" alt="${config.label}" /></span>
                            <span class="emotion-label">${config.label}</span>
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
                        ${entry.images && entry.images.length > 0 ? `
                            <div class="diary-detail-images">
                                <div class="diary-images-grid">
                                    ${entry.images.map(imageUrl => {
                                        const normalizedUrl = normalizeImageUrl(imageUrl);
                                        return `
                                            <div class="diary-image-item">
                                                <img src="${normalizedUrl}" alt="일기 이미지" onclick="window.open('${normalizedUrl}', '_blank')">
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}
                        <div class="diary-actions">
                            <button class="btn-edit" onclick="event.stopPropagation(); editDiary('${entry.id}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span>수정</span>
                            </button>
                            <button class="btn-delete" onclick="event.stopPropagation(); deleteDiary('${entry.id}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                <span>삭제</span>
                            </button>
                        </div>
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

function editDiary(diaryId) {
    window.location.href = `/write?id=${diaryId}`;
}

async function deleteDiary(diaryId) {
    if (!confirm('이 일기를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/diaries/${diaryId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                await loadDiaries();
                
                if (selectedDate) {
                    const entries = getEntriesForDate(selectedDate);
                    if (entries.length === 0) {
                        closeDiaryModal();
                    } else {
                        expandedDiaryId = null;
                        showDiaryModal(selectedDate, entries);
                    }
                }
            } else {
                alert('일기 삭제에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
            }
        } else {
            alert('일기 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error deleting diary:', error);
        alert('일기 삭제 중 오류가 발생했습니다.');
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

