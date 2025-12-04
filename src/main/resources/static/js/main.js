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

// 전역 변수에 일기 데이터 저장
let allDiaries = [];

function displayDiaries(diaries) {
    const listContainer = document.getElementById('diaryList');
    
    if (diaries.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <p>아직 작성된 일기가 없습니다.</p>
                <p>첫 번째 일기를 작성해보세요!</p>
            </div>
        `;
        allDiaries = [];
        return;
    }
    
    const sortedDiaries = [...diaries].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // 전역 변수에 저장
    allDiaries = sortedDiaries;
    
    listContainer.innerHTML = sortedDiaries.map(diary => {
        const config = emotionConfig[diary.emotion];
        const date = new Date(diary.date);
        const formattedDate = date.toLocaleDateString('ko-KR');
        
        return `
            <div class="diary-item ${diary.emotion}" onclick="openDiaryModal('${diary.id}')" style="cursor: pointer;">
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
                        <button class="btn-delete" onclick="event.stopPropagation(); deleteDiary('${diary.id}')">
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

function openDiaryModal(diaryId) {
    const diary = allDiaries.find(d => d.id === diaryId);
    if (!diary) return;
    
    const modal = document.getElementById('diaryModal');
    const modalTitle = document.getElementById('diaryModalTitle');
    const modalSubtitle = document.getElementById('diaryModalSubtitle');
    const modalContent = document.getElementById('diaryModalContent');
    
    if (!modal || !modalTitle || !modalSubtitle || !modalContent) {
        return;
    }
    
    const config = emotionConfig[diary.emotion] || emotionConfig.happy;
    const date = new Date(diary.date);
    const formattedDate = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    // 제목 설정
    modalTitle.textContent = escapeHtml(diary.title || '제목 없음');
    
    // 부제목 설정 (날짜만)
    modalSubtitle.textContent = formattedDate;
    
    // 헤더에 감정 배지 표시
    const emotionBadgeContainer = document.getElementById('diaryModalEmotionBadge');
    if (emotionBadgeContainer) {
        const emotionBgColor = {
            happy: 'rgba(250, 204, 21, 0.2)',
            angry: 'rgba(248, 113, 113, 0.2)',
            sad: 'rgba(96, 165, 250, 0.2)'
        }[diary.emotion] || 'rgba(250, 204, 21, 0.2)';
        
        const emotionBorderColor = {
            happy: '#facc15',
            angry: '#f87171',
            sad: '#60a5fa'
        }[diary.emotion] || '#facc15';
        
        emotionBadgeContainer.innerHTML = `
            <div class="diary-detail-emotion-badge ${diary.emotion}" style="background: ${emotionBgColor}; border: 1px solid ${emotionBorderColor};">
                <span class="emotion-icon">${config.icon}</span>
                <span class="emotion-label">${config.label}</span>
            </div>
        `;
    }
    
    // 내용 설정
    const contentHtml = `
        <div class="diary-detail-content">
            ${diary.content 
                ? diary.content.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join('')
                : '<p>내용이 없습니다.</p>'}
        </div>
        ${diary.images && diary.images.length > 0 ? `
            <div class="diary-detail-images">
                <div class="diary-images-grid">
                    ${diary.images.map(imageUrl => {
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
    `;
    
    modalContent.innerHTML = contentHtml;
    
    // 수정 버튼 이벤트 설정
    const editBtn = document.getElementById('diaryModalEditBtn');
    if (editBtn) {
        editBtn.onclick = function(e) {
            e.stopPropagation();
            editDiary(diary.id);
        };
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function editDiary(diaryId) {
    // 일기 수정 페이지로 이동 (일기 ID를 쿼리 파라미터로 전달)
    window.location.href = `/write?id=${diaryId}`;
}

function closeDiaryModal() {
    const modal = document.getElementById('diaryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// 모달 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    const modalClose = document.getElementById('diaryModalClose');
    const modalOverlay = document.getElementById('diaryModalOverlay');
    
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
});

loadDiaries();

