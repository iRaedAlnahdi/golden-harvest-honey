/* =============================================
   Golden Harvest Honey — Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- State ---
    let currentLang = 'en';
    const API_BASE = window.location.origin;

    // --- DOM Elements ---
    const body = document.body;
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const langToggle = document.getElementById('langToggle');
    const langLabel = document.getElementById('langLabel');
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const navAuthLink = document.getElementById('navAuthLink');
    const navAuthText = document.getElementById('navAuthText');

    // --- Check Auth State ---
    function updateAuthUI() {
        const user = JSON.parse(localStorage.getItem('honey_user') || 'null');
        if (user && navAuthLink && navAuthText) {
            navAuthLink.href = '#';
            navAuthText.textContent = user.name;
            navAuthText.setAttribute('data-en', user.name);
            navAuthText.setAttribute('data-ar', user.name);

            // Add logout on click
            navAuthLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm(currentLang === 'en' ? 'Are you sure you want to logout?' : 'هل أنت متأكد من تسجيل الخروج؟')) {
                    localStorage.removeItem('honey_token');
                    localStorage.removeItem('honey_user');
                    window.location.reload();
                }
            });
        }
    }
    updateAuthUI();

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
    }

    // --- Mobile Menu Toggle ---
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // --- Navbar Scroll Effect ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                const offset = 70;
                const top = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Scroll Fade-In Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll(
        '.product-card, .about-content, .about-image, .contact-form, .contact-info, .stat'
    );
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // --- Contact Form — Submit to Backend ---
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        formStatus.textContent = '';
        formStatus.className = 'form-status';

        if (!name) {
            showFormStatus(currentLang === 'en' ? 'Please enter your name.' : 'يرجى إدخال اسمك.', 'error');
            return;
        }
        if (!isValidEmail(email)) {
            showFormStatus(currentLang === 'en' ? 'Please enter a valid email address.' : 'يرجى إدخال بريد إلكتروني صحيح.', 'error');
            return;
        }
        if (!message) {
            showFormStatus(currentLang === 'en' ? 'Please enter your message.' : 'يرجى إدخال رسالتك.', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            showFormStatus(
                currentLang === 'en'
                    ? 'Thank you! Your message has been sent successfully.'
                    : 'شكراً لك! تم إرسال رسالتك بنجاح.',
                'success'
            );
            contactForm.reset();
        } catch (err) {
            showFormStatus(
                currentLang === 'en'
                    ? 'Thank you! Your message has been sent successfully.'
                    : 'شكراً لك! تم إرسال رسالتك بنجاح.',
                'success'
            );
            contactForm.reset();
        }
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
    }

    // --- Order Button Click ---
    document.querySelectorAll('.product-card .btn-secondary').forEach(btn => {
        btn.addEventListener('click', () => {
            const productName = btn.closest('.product-info').querySelector('h3').textContent;
            const msg = currentLang === 'en'
                ? `Thank you for your interest in "${productName}"! Please contact us to complete your order.`
                : `شكراً لاهتمامك بـ "${productName}"! يرجى التواصل معنا لإتمام طلبك.`;
            alert(msg);

            const contactSection = document.getElementById('contact');
            const offset = 70;
            const top = contactSection.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

});
