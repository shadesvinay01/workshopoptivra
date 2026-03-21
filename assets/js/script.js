document.addEventListener('DOMContentLoaded', () => {

    // 1. AOS ANIMATIONS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 900, once: true, offset: 80 });
    }

    // 2. HAMBURGER MENU TOGGLE
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('mainNav');
    if (hamburger && mainNav) {
        hamburger.addEventListener('click', () => mainNav.classList.toggle('open'));
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mainNav.classList.remove('open'));
        });
    }

    // 3. DARK MODE TOGGLE
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        if (localStorage.getItem('optivra-theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeBtn.textContent = '☀️';
        }
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('optivra-theme', isDark ? 'dark' : 'light');
            themeBtn.textContent = isDark ? '☀️' : '🌙';
        });
    }

    // 4. COUNTDOWN TIMER — March 29, 2026 at 10:00 AM IST (UTC+5:30)
    // IST = UTC+5:30 → 10:00 AM IST = 04:30 UTC on that day
    const TARGET_DATE = new Date('2026-03-29T04:30:00Z');

    function updateTimer() {
        const now = new Date();
        const diff = TARGET_DATE - now;

        if (diff <= 0) {
            const el = document.querySelector('.countdown-timer');
            if (el) el.innerHTML = '<div style="color:#fbbf24;font-size:18px;font-weight:700;text-align:center;padding:20px">🎉 Masterclass Is Live Right Now! Join Instantly.</div>';
            return;
        }

        const d = document.getElementById('days');
        const h = document.getElementById('hours');
        const m = document.getElementById('minutes');
        const s = document.getElementById('seconds');
        const pad = n => String(Math.floor(n)).padStart(2, '0');

        if (d) d.textContent = pad(diff / 86400000);
        if (h) h.textContent = pad((diff % 86400000) / 3600000);
        if (m) m.textContent = pad((diff % 3600000) / 60000);
        if (s) s.textContent = pad((diff % 60000) / 1000);
    }

    setInterval(updateTimer, 1000);
    updateTimer();

    // 5. TESTIMONIALS CAROUSEL — Infinite circular loop
    const carousel = document.getElementById('testimonialsCarousel');
    const dotsWrap = document.getElementById('carouselDots');
    let currentIndex = 0;
    let autoplayTimer = null;
    let isDragging = false;
    let dragStartX = 0;

    if (carousel && dotsWrap) {
        const origCards = Array.from(carousel.querySelectorAll('.testimonial-card'));
        const total = origCards.length;

        // Clone all cards and append for infinite effect
        origCards.forEach(card => {
            carousel.appendChild(card.cloneNode(true));
        });

        // Build dots (one per original card)
        origCards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Review ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        });

        function getCardWidth() {
            const allCards = carousel.querySelectorAll('.testimonial-card');
            if (!allCards[0]) return 382;
            const style = window.getComputedStyle(carousel);
            const gap = parseInt(style.gap) || 22;
            return allCards[0].offsetWidth + gap;
        }

        function updateDots(index) {
            const dotEls = dotsWrap.querySelectorAll('.carousel-dot');
            dotEls.forEach((d, i) => d.classList.toggle('active', i === (index % total)));
        }

        function goTo(index, animated = true) {
            currentIndex = index;
            if (!animated) carousel.style.transition = 'none';
            carousel.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
            if (!animated) {
                // Force reflow then re-enable transition
                void carousel.offsetWidth;
                carousel.style.transition = '';
            }
            updateDots(currentIndex % total);
        }

        function next() {
            currentIndex++;
            carousel.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
            carousel.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
            updateDots(currentIndex % total);

            // When we reach the cloned set, silently reset to original
            if (currentIndex >= total) {
                setTimeout(() => {
                    goTo(0, false);
                }, 750);
            }
        }

        function startAutoplay() {
            stopAutoplay();
            autoplayTimer = setInterval(next, 10000);
        }

        function stopAutoplay() {
            if (autoplayTimer) clearInterval(autoplayTimer);
        }

        // Drag / swipe
        carousel.addEventListener('mousedown', e => {
            isDragging = true;
            dragStartX = e.clientX;
            stopAutoplay();
        });

        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const delta = dragStartX - e.clientX;
            const offset = currentIndex * getCardWidth() + delta;
            carousel.style.transition = 'none';
            carousel.style.transform = `translateX(-${offset}px)`;
        });

        window.addEventListener('mouseup', e => {
            if (!isDragging) return;
            isDragging = false;
            const delta = dragStartX - e.clientX;
            carousel.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
            if (Math.abs(delta) > 60) {
                if (delta > 0) next();
                else { currentIndex = Math.max(0, currentIndex - 1); goTo(currentIndex); }
            } else {
                goTo(currentIndex);
            }
            startAutoplay();
        });

        carousel.addEventListener('touchstart', e => {
            dragStartX = e.touches[0].clientX;
            stopAutoplay();
        }, { passive: true });

        carousel.addEventListener('touchend', e => {
            const delta = dragStartX - e.changedTouches[0].clientX;
            if (delta > 50) next();
            else if (delta < -50) { currentIndex = Math.max(0, currentIndex - 1); goTo(currentIndex); }
            else goTo(currentIndex);
            startAutoplay();
        }, { passive: true });

        // Init
        goTo(0, false);
        startAutoplay();
    }


    // ---- GOOGLE APPS SCRIPT ENDPOINT ----
    // IMPORTANT: The URL must end in "/exec". A URL with "/library/" is incorrect.
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-5clN15b9FiIlllWZ7DpXDJ8Wx-g4ho8Anogk4rVikEa-l6qucJSRCkKm-LHsyjM4DQ/exec';

    function postToScript(payload, onSuccess, onError, btn, originalText) {
        if (SCRIPT_URL.includes('INSERT') || SCRIPT_URL.includes('library')) {
            onError('Invalid Script URL. Make sure you copied the Web App URL ending in /exec');
            setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);
            return;
        }

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Essential for Google Apps Script to prevent CORS errors
            headers: { 'Content-Type': 'text/plain' }, // Prevents preflight OPTIONS request
            body: JSON.stringify(payload)
        })
            .then(() => {
                // With 'no-cors', the response is opaque (we can't read the JSON).
                // If it reaches here without throwing a network error, it succeeded.
                onSuccess();
            })
            .catch(() => onError('Network error. Please try again.'))
            .finally(() => { btn.textContent = originalText; btn.disabled = false; });
    }

    // 6. REFERRAL FORM
    const referralForm = document.getElementById('referralForm');
    if (referralForm) {
        referralForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = document.getElementById('refSubmitBtn');
            const msg = document.getElementById('referralMessage');
            const orig = btn.textContent;
            btn.textContent = 'Submitting...'; btn.disabled = true; msg.textContent = '';
            postToScript(
                { type: 'referral', name: document.getElementById('refName').value, email: document.getElementById('refEmail').value, phone: document.getElementById('refPhone').value || '', referredBy: document.getElementById('refReferrer').value || '', college: document.getElementById('refCollege').value || '' },
                () => { msg.style.color = '#10b981'; msg.textContent = '✅ Registered! Your unique referral code will arrive by email shortly.'; referralForm.reset(); },
                err => { msg.style.color = '#ef4444'; msg.textContent = '❌ ' + err; },
                btn, orig
            );
        });
    }

    // 7. AMBASSADOR FORM
    const ambassadorForm = document.getElementById('ambassadorForm');
    if (ambassadorForm) {
        ambassadorForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = document.getElementById('ambSubmitBtn');
            const msg = document.getElementById('ambassadorMessage');
            const orig = btn.textContent;
            btn.textContent = 'Submitting...'; btn.disabled = true; msg.textContent = '';
            const motEl = document.getElementById('ambMotivation');
            postToScript(
                { type: 'campus_ambassador', name: document.getElementById('ambName').value, email: document.getElementById('ambEmail').value, phone: document.getElementById('ambPhone').value || '', college: document.getElementById('ambCollege').value || '', motivation: motEl ? motEl.value : '', referredBy: document.getElementById('ambReferral').value || '' },
                () => { msg.style.color = '#10b981'; msg.textContent = '✅ Application submitted! Welcome to the Elite 100! We will reach out within 24 hours.'; ambassadorForm.reset(); },
                err => { msg.style.color = '#ef4444'; msg.textContent = '❌ ' + err; },
                btn, orig
            );
        });
    }
});

// MODAL CONTROLS (global scope)
function openModal() {
    const m = document.getElementById('ambassadorModal');
    if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal() {
    const m = document.getElementById('ambassadorModal');
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
}
function switchTab(tab) {
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
    const t = document.getElementById('tab-' + tab);
    const c = document.getElementById('content-' + tab);
    if (t) t.classList.add('active');
    if (c) c.classList.add('active');
}
document.addEventListener('click', e => {
    const m = document.getElementById('ambassadorModal');
    if (m && e.target === m) closeModal();
});