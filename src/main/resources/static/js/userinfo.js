const CONTEXT_PATH = typeof CONTEXT_PATH_JSP !== 'undefined' ? CONTEXT_PATH_JSP : '';

let userInfo = null;

// 페이지 로드 시 사용자 정보 불러오기
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    
    // 폼 제출 이벤트
    document.getElementById('userInfoForm').addEventListener('submit', handleFormSubmit);
    
    // 새 비밀번호 입력 시 현재 비밀번호와 비교
    const newPasswordInput = document.getElementById('newPassword');
    const passwordInput = document.getElementById('password');
    
    newPasswordInput.addEventListener('input', function() {
        checkPasswordMatch();
    });
    
    passwordInput.addEventListener('input', function() {
        if (!passwordInput.disabled) {
            checkPasswordMatch();
        }
    });
});

async function loadUserInfo() {
    try {
        const response = await fetch(`${CONTEXT_PATH}/api/user/info`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                userInfo = data.user;
                populateForm(data.user);
            } else {
                showError(data.message || '사용자 정보를 불러올 수 없습니다.');
            }
        } else {
            showError('사용자 정보를 불러올 수 없습니다.');
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        showError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    }
}

function populateForm(user) {
    // 기본 정보
    document.getElementById('email').value = user.email || '';
    document.getElementById('nickname').value = user.nickname || '';
    
    // 통계 정보
    document.getElementById('totalDiaries').textContent = user.totalDiaries || 0;
    
    // 가입일 포맷팅
    if (user.createdAt) {
        const date = new Date(user.createdAt);
        const formattedDate = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('createdAt').textContent = formattedDate;
    }
}

function checkPasswordMatch() {
    const passwordInput = document.getElementById('password');
    const newPasswordInput = document.getElementById('newPassword');
    const password = passwordInput.value;
    const newPassword = newPasswordInput.value;
    
    // 새 비밀번호 필드의 부모 요소 찾기
    const newPasswordGroup = newPasswordInput.closest('.form-group');
    let messageEl = document.getElementById('newPasswordMessage');
    
    // 새 비밀번호가 비어있으면 메시지 제거
    if (!newPassword) {
        if (messageEl) {
            messageEl.remove();
        }
        return true;
    }
    
    // 현재 비밀번호가 비어있거나 비활성화되어 있으면 비교하지 않음
    if (!password || passwordInput.disabled) {
        if (messageEl) {
            messageEl.remove();
        }
        return true;
    }
    
    // 메시지 요소가 없으면 생성
    if (!messageEl) {
        messageEl = document.createElement('p');
        messageEl.id = 'newPasswordMessage';
        messageEl.className = 'form-help';
        // 새 비밀번호 입력 필드 다음에 삽입
        newPasswordInput.parentElement.appendChild(messageEl);
    }
    
    // 비밀번호가 같은지 확인
    if (password === newPassword) {
        messageEl.textContent = '⚠ 현재 비밀번호와 동일한 비밀번호로 변경할 수 없습니다.';
        messageEl.className = 'form-help error';
        return false;
    } else {
        if (messageEl) {
            messageEl.remove();
        }
        return true;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // 메시지 제거
    clearMessages();
    
    const email = document.getElementById('email').value.trim();
    const nickname = document.getElementById('nickname').value.trim();
    const password = document.getElementById('password').value;
    const newPassword = document.getElementById('newPassword').value;
    
    // 유효성 검사
    if (!email || !nickname) {
        showError('이메일과 닉네임은 필수 항목입니다.');
        return;
    }
    
    // 비밀번호 변경 시 검증
    if (newPassword || password) {
        if (!password) {
            showError('현재 비밀번호를 입력해주세요.');
            return;
        }
        if (!newPassword) {
            showError('새 비밀번호를 입력해주세요.');
            return;
        }
        if (newPassword.length < 4) {
            showError('새 비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }
        
        // 현재 비밀번호와 새 비밀번호가 같은지 확인
        if (password === newPassword) {
            showError('현재 비밀번호와 동일한 비밀번호로 변경할 수 없습니다.');
            // 동적 검증 메시지도 표시
            checkPasswordMatch();
            return;
        }
    }
    
    // 동적 검증 재확인
    if (!checkPasswordMatch()) {
        return;
    }
    
    // 비밀번호 변경이 없는 경우 비밀번호 필드 제거
    const userData = {
        email: email,
        nickname: nickname
    };
    
    if (newPassword && password) {
        userData.password = password;
        userData.newPassword = newPassword;
    }
    
    try {
        const response = await fetch(`${CONTEXT_PATH}/api/user/info`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.message || '사용자 정보가 수정되었습니다.');
            
            // 비밀번호 필드 초기화
            if (newPassword) {
                document.getElementById('password').value = '';
                document.getElementById('newPassword').value = '';
            }
            
            // 세션 업데이트를 위해 잠시 후 페이지 새로고침
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showError(data.message || '사용자 정보 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error updating user info:', error);
        showError('사용자 정보 수정 중 오류가 발생했습니다.');
    }
}

function showError(message) {
    clearMessages();
    const form = document.getElementById('userInfoForm');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
}

function showSuccess(message) {
    clearMessages();
    const form = document.getElementById('userInfoForm');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    form.insertBefore(successDiv, form.firstChild);
}

function clearMessages() {
    const existingError = document.querySelector('.error-message');
    const existingSuccess = document.querySelector('.success-message');
    if (existingError) existingError.remove();
    if (existingSuccess) existingSuccess.remove();
}

async function verifyPassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value.trim();
    const messageEl = document.getElementById('passwordVerifyMessage');
    const verifyBtn = document.getElementById('verifyPasswordBtn');
    
    if (!password) {
        messageEl.textContent = '비밀번호를 입력해주세요.';
        messageEl.className = 'form-help error';
        return;
    }
    
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<span>확인 중...</span>';
    messageEl.textContent = '';
    messageEl.className = 'form-help';
    
    try {
        const response = await fetch(`${CONTEXT_PATH}/api/user/verify-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ password: password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageEl.textContent = '✓ 비밀번호가 확인되었습니다.';
            messageEl.className = 'form-help success';
            passwordInput.disabled = true;
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>확인됨</span>
            `;
        } else {
            messageEl.textContent = data.message || '비밀번호가 일치하지 않습니다.';
            messageEl.className = 'form-help error';
            passwordInput.disabled = false;
            verifyBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>확인</span>
            `;
        }
    } catch (error) {
        console.error('Error verifying password:', error);
        messageEl.textContent = '비밀번호 확인 중 오류가 발생했습니다.';
        messageEl.className = 'form-help error';
        verifyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>확인</span>
        `;
    } finally {
        verifyBtn.disabled = false;
    }
}

// 비밀번호 입력 필드에서 Enter 키로 확인
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                verifyPassword();
            }
        });
    }
});

async function handleDeleteAccount() {
    if (!confirm('정말로 탈퇴하시겠습니까?\n\n탈퇴하면 모든 일기와 데이터가 영구적으로 삭제되며 복구할 수 없습니다.')) {
        return;
    }
    
    const password = prompt('탈퇴를 확인하기 위해 비밀번호를 입력해주세요:');
    if (!password) {
        return;
    }
    
    try {
        const response = await fetch(`${CONTEXT_PATH}/api/user/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ password: password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('탈퇴가 완료되었습니다.');
            window.location.href = `${CONTEXT_PATH}/login`;
        } else {
            alert(data.message || '탈퇴에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('탈퇴 중 오류가 발생했습니다.');
    }
}

