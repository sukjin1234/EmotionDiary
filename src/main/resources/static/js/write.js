const emotionLabels = {
    happy: '기쁨',
    anxiety: '불안',
    embarrassed: '당황',
    sad: '슬픔',
    angry: '분노',
    hurt: '상처'
};

// 이미지 업로드 관련 변수
let selectedImages = [];
let existingImages = []; // 수정 모드에서 기존 이미지
let isEditMode = false; // 수정 모드 여부
let currentDiaryId = null; // 현재 수정 중인 일기 ID
let emotionAnalyzed = false; // 감정 분석 완료 여부

// 이미지 URL 정규화 함수
function normalizeImageUrl(imageUrl) {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('/resources/images/')) {
        return imageUrl.replace('/resources/images/', '/images/');
    }
    return imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
}

// 페이지 로드 시 수정 모드 확인 및 데이터 로드
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const diaryId = urlParams.get('id');
    
    if (diaryId) {
        isEditMode = true;
        currentDiaryId = diaryId;
        
        // 페이지 제목 변경
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = '일기 수정';
        }
        
        // 기존 일기 데이터 로드
        await loadDiaryForEdit(diaryId);
    } else {
        // 새 일기 작성 모드
        const dateInput = document.getElementById('diaryDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }
});

// 수정 모드를 위한 일기 데이터 로드
async function loadDiaryForEdit(diaryId) {
    try {
        const response = await fetch(`/api/diaries/${diaryId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.diary) {
                const diary = data.diary;
                
                // 일기 ID 저장
                const diaryIdInput = document.getElementById('diaryId');
                if (diaryIdInput) {
                    diaryIdInput.value = diary.id;
                }
                
                // 폼에 데이터 채우기
                const titleInput = document.getElementById('title');
                const contentInput = document.getElementById('content');
                const dateInput = document.getElementById('diaryDate');
                
                if (titleInput) titleInput.value = diary.title || '';
                if (contentInput) {
                    contentInput.value = diary.content || '';
                    // 원본 내용 저장 (내용 변경 감지용)
                    originalContent = diary.content || '';
                }
                if (dateInput && diary.date) {
                    // 날짜 형식 변환 (YYYY-MM-DD)
                    const date = new Date(diary.date);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    dateInput.value = `${year}-${month}-${day}`;
                }
                
                // 기존 이미지 표시
                if (diary.images && diary.images.length > 0) {
                    existingImages = diary.images.map(url => ({
                        url: normalizeImageUrl(url),
                        isExisting: true
                    }));
                    updateImagePreview();
                }
                
                // 기존 감정 표시
                if (diary.emotion) {
                    const resultDiv = document.getElementById('emotionResult');
                    const resultEmotion = document.getElementById('resultEmotion');
                    if (resultDiv && resultEmotion) {
                        resultEmotion.textContent = emotionLabels[diary.emotion] || diary.emotion;
                        resultDiv.style.display = 'block';
                        resultDiv.dataset.emotion = diary.emotion;
                        // 기존 클래스 제거 후 새로운 감정 클래스 추가
                        resultDiv.className = 'emotion-result ' + diary.emotion;
                        // 수정 모드에서 기존 감정이 있으면 분석 완료 플래그 설정
                        emotionAnalyzed = true;
                    }
                }
            } else {
                alert('일기를 불러올 수 없습니다.');
                window.location.href = '/main';
            }
    } else {
            alert('일기를 불러올 수 없습니다.');
            window.location.href = '/main';
        }
    } catch (error) {
        console.error('Error loading diary:', error);
        alert('일기를 불러오는 중 오류가 발생했습니다.');
        window.location.href = '/main';
    }
}

// 내용 변경 시 감정 분석 상태 업데이트 (수정 모드에서 감정 분석 다시 가능하도록)
let originalContent = '';
document.getElementById('content').addEventListener('input', function() {
    const currentContent = this.value.trim();
    // 내용이 변경되었으면 감정 분석 상태를 업데이트 (수정 모드에서 감정 분석 다시 가능하도록)
    if (isEditMode && originalContent !== currentContent && currentContent.length > 0) {
        // 내용이 변경되었으므로 감정 분석을 다시 할 수 있도록 플래그는 유지
        // (수정 모드에서는 기존 감정이 있어도 내용 변경 시 새로운 감정으로 업데이트 가능)
    }
});

// 이미지 업로드 버튼 클릭
document.getElementById('imageUploadBtn').addEventListener('click', function() {
    document.getElementById('imageInput').click();
});

// 이미지 선택 시
document.getElementById('imageInput').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                selectedImages.push({
                    file: file,
                    preview: event.target.result
                });
                updateImagePreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 같은 파일을 다시 선택할 수 있도록 input 초기화
    e.target.value = '';
});

// 이미지 미리보기 업데이트
function updateImagePreview() {
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '';
    
    let imageIndex = 0;
    
    // 기존 이미지 표시
    existingImages.forEach((imageData, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        
        const img = document.createElement('img');
        img.src = imageData.url;
        img.alt = '기존 이미지';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'image-remove';
        removeBtn.setAttribute('aria-label', '이미지 제거');
        removeBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        
        const currentIndex = index;
        removeBtn.addEventListener('click', function() {
            existingImages.splice(currentIndex, 1);
            updateImagePreview();
        });
        
        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        previewContainer.appendChild(previewItem);
        imageIndex++;
    });
    
    // 새로 선택한 이미지 표시
    selectedImages.forEach((imageData, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        
        const img = document.createElement('img');
        img.src = imageData.preview;
        img.alt = '새 이미지';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'image-remove';
        removeBtn.setAttribute('aria-label', '이미지 제거');
        removeBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        
        const currentIndex = index;
        removeBtn.addEventListener('click', function() {
            selectedImages.splice(currentIndex, 1);
            updateImagePreview();
        });
        
        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        previewContainer.appendChild(previewItem);
    });
}

document.getElementById('analyzeBtn').addEventListener('click', async function() {
    const content = document.getElementById('content').value.trim();
    
    if (!content) {
        alert('내용을 입력해주세요.');
        return;
    }
    
    try {
        // 서버 API 호출하여 감정 분석 수행
        const response = await fetch('/api/analyze-emotion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: content }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.emotion) {
            const emotion = data.emotion;
            const resultDiv = document.getElementById('emotionResult');
            const resultEmotion = document.getElementById('resultEmotion');
            
            resultEmotion.textContent = emotionLabels[emotion] || emotion;
            resultDiv.style.display = 'block';
            resultDiv.dataset.emotion = emotion;
            // 기존 클래스 제거 후 새로운 감정 클래스 추가
            resultDiv.className = 'emotion-result ' + emotion;
            
            // 감정 분석 완료 플래그 설정
            emotionAnalyzed = true;
        } else {
            alert('감정 분석에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('Error analyzing emotion:', error);
        alert('감정 분석 중 오류가 발생했습니다.');
    }
});

document.getElementById('diaryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }
    
    const resultDiv = document.getElementById('emotionResult');
    let emotion = resultDiv.dataset.emotion;
    
    // 감정 분석이 완료되지 않았으면 자동으로 감정 분석 수행 (서버 API 호출)
    if (!emotion || !emotionAnalyzed) {
        try {
            const analyzeResponse = await fetch('/api/analyze-emotion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: content }),
                credentials: 'include'
            });
            
            const analyzeData = await analyzeResponse.json();
            
            if (analyzeData.success && analyzeData.emotion) {
                emotion = analyzeData.emotion;
                const resultEmotion = document.getElementById('resultEmotion');
                
                if (resultDiv && resultEmotion) {
                    resultEmotion.textContent = emotionLabels[emotion] || emotion;
                    resultDiv.style.display = 'block';
                    resultDiv.dataset.emotion = emotion;
                    // 기존 클래스 제거 후 새로운 감정 클래스 추가
                    resultDiv.className = 'emotion-result ' + emotion;
                }
                emotionAnalyzed = true;
            } else {
                alert('감정 분석에 실패했습니다: ' + (analyzeData.message || '알 수 없는 오류'));
                return;
            }
        } catch (error) {
            console.error('Error analyzing emotion:', error);
            alert('감정 분석 중 오류가 발생했습니다.');
            return;
        }
    }
    const dateInput = document.getElementById('diaryDate');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    try {
        // 1. 새로 선택한 이미지 업로드
        let newImageUrls = [];
        if (selectedImages.length > 0) {
            const formData = new FormData();
            selectedImages.forEach((imageData, index) => {
                formData.append('images', imageData.file);
            });
            
            const imageResponse = await fetch('/api/images/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                if (imageData.success) {
                    newImageUrls = imageData.imageUrls || [];
                } else {
                    alert('이미지 업로드에 실패했습니다: ' + (imageData.message || '알 수 없는 오류'));
                    return;
                }
            } else {
                alert('이미지 업로드에 실패했습니다.');
                return;
            }
        }
        
        // 2. 모든 이미지 URL 결합 (기존 + 새로 업로드)
        const allImageUrls = [
            ...existingImages.map(img => img.url),
            ...newImageUrls
        ];
        
        // 3. 일기 데이터 구성
    const diary = {
        title,
        content,
        emotion,
            date: selectedDate,
            imageUrls: allImageUrls
        };
        
        // 4. 일기 저장 또는 수정
        const diaryId = document.getElementById('diaryId')?.value;
        const url = diaryId && isEditMode ? `/api/diaries/${diaryId}` : '/api/diaries';
        const method = diaryId && isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(diary),
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                window.location.href = '/main';
            } else {
                alert(data.message || (isEditMode ? '일기 수정에 실패했습니다.' : '일기 저장에 실패했습니다.'));
            }
        } else {
            alert(isEditMode ? '일기 수정에 실패했습니다.' : '일기 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error saving diary:', error);
        alert(isEditMode ? '일기 수정 중 오류가 발생했습니다.' : '일기 저장 중 오류가 발생했습니다.');
    }
});

