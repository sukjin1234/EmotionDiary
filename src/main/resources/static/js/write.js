const emotionLabels = {
    happy: '행복',
    angry: '분노',
    sad: '슬픔'
};

const happyKeywords = [
    '행복', '기쁨', '좋아', '즐거', '웃', '신나', '최고', '사랑', '감사',
    '축하', '성공', '재미', '만족', '평화', '희망', '화창', '맛있', '예쁘'
];

const angryKeywords = [
    '화', '짜증', '분노', '싫', '미워', '열받', '빡', '억울', '속상',
    '답답', '짜증나', '불쾌', '기분나쁘', '불만', '화나'
];

const sadKeywords = [
    '슬프', '우울', '눈물', '힘들', '외로', '아프', '고민', '걱정',
    '불안', '두렵', '무서', '안타깝', '후회', '그립', '쓸쓸', '허전'
];

function analyzeEmotion(text) {
    const lowerText = text.toLowerCase();
    
    let happyScore = 0;
    let angryScore = 0;
    let sadScore = 0;
    
    happyKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) happyScore++;
    });
    
    angryKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) angryScore++;
    });
    
    sadKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) sadScore++;
    });
    
    if (happyScore >= angryScore && happyScore >= sadScore) {
        return 'happy';
    } else if (angryScore >= sadScore) {
        return 'angry';
    } else {
        return 'sad';
    }
}

// 이미지 업로드 관련 변수
let selectedImages = [];

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
    
    selectedImages.forEach((imageData, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        
        const img = document.createElement('img');
        img.src = imageData.preview;
        img.alt = '미리보기';
        
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
        
        removeBtn.addEventListener('click', function() {
            selectedImages.splice(index, 1);
            updateImagePreview();
        });
        
        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        previewContainer.appendChild(previewItem);
    });
}

document.getElementById('analyzeBtn').addEventListener('click', function() {
    const content = document.getElementById('content').value.trim();
    
    if (!content) {
        alert('내용을 입력해주세요.');
        return;
    }
    
    const emotion = analyzeEmotion(content);
    const resultDiv = document.getElementById('emotionResult');
    const resultEmotion = document.getElementById('resultEmotion');
    
    resultEmotion.textContent = emotionLabels[emotion];
    resultDiv.style.display = 'block';
    resultDiv.dataset.emotion = emotion;
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
    const emotion = resultDiv.dataset.emotion || analyzeEmotion(content);
    const dateInput = document.getElementById('diaryDate');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    try {
        // 1. 먼저 이미지 업로드
        let imageUrls = [];
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
                    imageUrls = imageData.imageUrls || [];
                } else {
                    alert('이미지 업로드에 실패했습니다: ' + (imageData.message || '알 수 없는 오류'));
                    return;
                }
            } else {
                alert('이미지 업로드에 실패했습니다.');
                return;
            }
        }
        
        // 2. 일기 저장 (이미지 URL 포함)
        const diary = {
            title,
            content,
            emotion,
            date: selectedDate,
            imageUrls: imageUrls
        };
        
        const response = await fetch('/api/diaries', {
            method: 'POST',
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
                alert(data.message || '일기 저장에 실패했습니다.');
            }
        } else {
            alert('일기 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error saving diary:', error);
        alert('일기 저장 중 오류가 발생했습니다.');
    }
});

