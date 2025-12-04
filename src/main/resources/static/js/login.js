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

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!userId || !password) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, password }),
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                window.location.href = '/main';
            } else {
                alert(data.message || '로그인에 실패했습니다.');
            }
        } else {
            alert('로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('로그인 중 오류가 발생했습니다.');
    }
});

