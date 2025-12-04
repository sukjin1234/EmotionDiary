// 비밀번호 표시/숨김 토글 기능
document.getElementById('passwordToggle').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const eyeOpen = this.querySelector('.eye-open');
    const eyeClose = this.querySelector('.eye-close');
    
    if (passwordInput.type === 'password') {
        // 비밀번호 보이기 - 열린 눈 아이콘 표시
        passwordInput.type = 'text';
        eyeClose.style.display = 'none';
        eyeOpen.style.display = 'block';
    } else {
        // 비밀번호 숨기기 - 닫힌 눈 아이콘 표시
        passwordInput.type = 'password';
        eyeOpen.style.display = 'none';
        eyeClose.style.display = 'block';
    }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 에러 메시지 초기화
    clearErrors();
    
    const email = document.getElementById('email').value.trim();
    const nickname = document.getElementById('nickname').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // 유효성 검사
    let isValid = true;
    
    if (!email) {
        showError('emailError', '이메일을 입력해주세요.');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', '올바른 이메일 형식을 입력해주세요.');
        isValid = false;
    }
    
    if (!nickname) {
        showError('nicknameError', '아이디를 입력해주세요.');
        isValid = false;
    } else if (nickname.length < 2) {
        showError('nicknameError', '아이디는 2자 이상이어야 합니다.');
        isValid = false;
    }
    
    if (!password) {
        showError('passwordError', '비밀번호를 입력해주세요.');
        isValid = false;
    } else if (password.length < 4) {
        showError('passwordError', '비밀번호는 4자 이상이어야 합니다.');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // 회원가입 요청
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, nickname, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            window.location.href = '/login';
        } else {
            // 서버에서 오는 에러 메시지 처리
            const errorMessage = data.message || '회원가입에 실패했습니다.';
            
            if (errorMessage.includes('이메일')) {
                showError('emailError', errorMessage);
                document.getElementById('email').classList.add('error');
            } else if (errorMessage.includes('아이디') || errorMessage.includes('닉네임')) {
                showError('nicknameError', errorMessage);
                document.getElementById('nickname').classList.add('error');
            } else {
                alert(errorMessage);
            }
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('회원가입 중 오류가 발생했습니다.');
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        const inputElement = document.getElementById(elementId.replace('Error', ''));
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
    
    const inputElements = document.querySelectorAll('.form-group input');
    inputElements.forEach(el => el.classList.remove('error'));
}

// 입력 시 에러 메시지 제거
document.getElementById('email').addEventListener('input', function() {
    clearFieldError('email', 'emailError');
});

document.getElementById('nickname').addEventListener('input', function() {
    clearFieldError('nickname', 'nicknameError');
});

document.getElementById('password').addEventListener('input', function() {
    clearFieldError('password', 'passwordError');
});

function clearFieldError(inputId, errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
    }
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

