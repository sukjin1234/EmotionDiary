const emotionConfig = {
    happy: {
        icon: '😊',
        label: '행복',
        color: '#facc15',
        bgColor: '#fef9c3',
        borderColor: '#fde047'
    },
    angry: {
        label: '분노',
        icon: '😠',
        color: '#f87171',
        bgColor: '#fee2e2',
        borderColor: '#fca5a5'
    },
    sad: {
        label: '슬픔',
        icon: '😢',
        color: '#60a5fa',
        bgColor: '#dbeafe',
        borderColor: '#93c5fd'
    }
};

async function loadDiaries() {
    try {
        const response = await fetch('/api/diaries', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const diaries = await response.json();
            displayDiaries(diaries);
            displayEmotionStats(diaries);
        } else {
            console.error('Failed to load diaries');
        }
    } catch (error) {
        console.error('Error loading diaries:', error);
    }
}

function displayEmotionStats(diaries) {
    const stats = diaries.reduce((acc, diary) => {
        acc[diary.emotion] = (acc[diary.emotion] || 0) + 1;
        return acc;
    }, {});
    
    const statsContainer = document.getElementById('emotionStats');
    statsContainer.innerHTML = '';
    
    Object.entries(emotionConfig).forEach(([emotion, config]) => {
        const count = stats[emotion] || 0;
        const card = document.createElement('div');
        card.className = `emotion-stat-card ${emotion}`;
        card.innerHTML = `
            <div class="emotion-stat-icon">${config.icon}</div>
            <p class="emotion-stat-label">${config.label}</p>
            <p class="emotion-stat-count">${count}개</p>
        `;
        statsContainer.appendChild(card);
    });
}

function displayDiaries(diaries) {
    const listContainer = document.getElementById('diaryList');
    
    if (diaries.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <p>아직 작성된 일기가 없습니다.</p>
                <p>첫 번째 일기를 작성해보세요!</p>
            </div>
        `;
        return;
    }
    
    const sortedDiaries = [...diaries].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    listContainer.innerHTML = sortedDiaries.map(diary => {
        const config = emotionConfig[diary.emotion];
        const date = new Date(diary.date);
        const formattedDate = date.toLocaleDateString('ko-KR');
        
        return `
            <div class="diary-item ${diary.emotion}">
                <div class="diary-header">
                    <div class="diary-header-left">
                        <div class="diary-emotion-icon">${config.icon}</div>
                        <div class="diary-title-date">
                            <h3 class="diary-title">${escapeHtml(diary.title)}</h3>
                            <p class="diary-date">${formattedDate}</p>
                        </div>
                    </div>
                    <div class="diary-header-right">
                        <span class="emotion-badge ${diary.emotion}">${config.label}</span>
                        <button class="btn-delete" onclick="deleteDiary('${diary.id}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <p class="diary-content">${escapeHtml(diary.content)}</p>
            </div>
        `;
    }).join('');
}

async function deleteDiary(id) {
    if (!confirm('이 일기를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/diaries/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            loadDiaries();
        } else {
            alert('일기 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error deleting diary:', error);
        alert('일기 삭제 중 오류가 발생했습니다.');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

loadDiaries();

