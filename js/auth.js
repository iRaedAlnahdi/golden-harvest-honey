/* =============================================
   Golden Harvest Honey — Auth JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    let currentLang = 'en';
    const API_BASE = window.location.origin;

    // --- DOM Elements ---
    const body = document.body;
    const langToggle = document.getElementById('langToggle');
    const langLabel = document.getElementById('langLabel');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const tabIndicator = document.getElementById('tabIndicator');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginStatus = document.getElementById('loginStatus');
    const registerStatus = document.getElementById('registerStatus');

    // --- Language Toggle ---
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'ar' : 'en';
        applyLanguage(currentLang);
    });

    function applyLanguage(lang) {
        if (lang === 'ar') {
            body.classList.add('rtl');
            document.documentElement.setAttribute('lang', 'ar');
            document.documentElement.setAttribute('dir', 'rtl');
            langLabel.textContent = 'English';
        } else {
            body.classList.remove('rtl');
            document.documentElement.setAttribute('lang', 'en');
            document.documentElement.setAttribute('dir', 'ltr');
            langLabel.textContent = 'العربية';
        }

        document.querySelectorAll('[data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) el.textContent = text;
        });

        document.querySelectorAll('[data-en-placeholder]').forEach(el => {
            const placeholder = el.getAttribute(`data-${lang}-placeholder`);
            if (placeholder) el.setAttribute('placeholder', placeholder);
        });

        // Fix back arrow direction
        const backHome = document.querySelector('.back-home');
        if (backHome) {
            const text = backHome.getAttribute(`data-${lang}`);
            if (text) backHome.textContent = text;
        }
    }

    // --- Tab Switching ---
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        tabIndicator.classList.remove('right');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        clearStatus();
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        tabIndicator.classList.add('right');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        clearStatus();
    });

    // --- Password Toggle ---
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const eyeOpen = btn.querySelector('.eye-open');
            const eyeClosed = btn.querySelector('.eye-closed');

            if (input.type === 'password') {
                input.type = 'text';
                if (eyeOpen) eyeOpen.style.display = 'none';
                if (eyeClosed) eyeClosed.style.display = 'block';
            } else {
                input.type = 'password';
                if (eyeOpen) eyeOpen.style.display = 'block';
                if (eyeClosed) eyeClosed.style.display = 'none';
            }
        });
    });

    // --- Login Form Submit ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const submitBtn = loginForm.querySelector('.btn-submit');

        clearStatus();
        submitBtn.classList.add('loading');
        submitBtn.textContent = '';

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save token and user
            localStorage.setItem('honey_token', data.token);
            localStorage.setItem('honey_user', JSON.stringify(data.user));

            showStatus(loginStatus, currentLang === 'en'
                ? 'Login successful! Redirecting...'
                : 'تم تسجيل الدخول بنجاح! جاري التحويل...', 'success');

            setTimeout(() => {
                window.location.href = '/';
            }, 1000);

        } catch (err) {
            showStatus(loginStatus, err.message, 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.textContent = submitBtn.getAttribute(`data-${currentLang}`) || 'Sign In';
        }
    });

    // --- Register Form Submit ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        const submitBtn = registerForm.querySelector('.btn-submit');

        clearStatus();

        if (password !== confirm) {
            showStatus(registerStatus, currentLang === 'en'
                ? 'Passwords do not match.'
                : 'كلمات المرور غير متطابقة.', 'error');
            return;
        }

        submitBtn.classList.add('loading');
        submitBtn.textContent = '';

        try {
            const res = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Save token and user
            localStorage.setItem('honey_token', data.token);
            localStorage.setItem('honey_user', JSON.stringify(data.user));

            showStatus(registerStatus, currentLang === 'en'
                ? 'Account created! Redirecting...'
                : 'تم إنشاء الحساب! جاري التحويل...', 'success');

            setTimeout(() => {
                window.location.href = '/';
            }, 1000);

        } catch (err) {
            showStatus(registerStatus, err.message, 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.textContent = submitBtn.getAttribute(`data-${currentLang}`) || 'Create Account';
        }
    });

    // --- Helpers ---
    function showStatus(el, message, type) {
        el.textContent = message;
        el.className = `form-status show ${type}`;
    }

    function clearStatus() {
        loginStatus.className = 'form-status';
        loginStatus.textContent = '';
        registerStatus.className = 'form-status';
        registerStatus.textContent = '';
    }

    // --- Check if already logged in ---
    const token = localStorage.getItem('honey_token');
    if (token) {
        window.location.href = '/';
    }
});
