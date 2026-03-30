/**
 * ГРАНД — main.js
 *
 * Модули:
 * 1. Прелоадер
 * 2. Sticky-хедер
 * 3. Мобильное меню (hamburger)
 * 4. Бегущая строка (infinite ticker)
 * 5. Форма обратной связи + маска телефона
 * 6. Модальное окно «Спасибо»
 * 7. Анимация появления секций (IntersectionObserver)
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. ПРЕЛОАДЕР
       ============================================================ */
    const preloader = document.getElementById('preloader');

    function hidePreloader() {
        if (!preloader) return;
        preloader.classList.add('hidden');
        // Убираем из DOM после завершения анимации
        preloader.addEventListener('transitionend', () => {
            preloader.remove();
        }, { once: true });
    }

    // Скрываем после полной загрузки страницы (минимум 1.5 с)
    const preloaderMin = 1500;
    const preloaderStart = Date.now();

    window.addEventListener('load', () => {
        const elapsed = Date.now() - preloaderStart;
        const delay = Math.max(0, preloaderMin - elapsed);
        setTimeout(hidePreloader, delay);
    });

    /* ============================================================
       2. STICKY-ХЕДЕР
       ============================================================ */
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        header?.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    /* ============================================================
       3. МОБИЛЬНОЕ МЕНЮ
       ============================================================ */
    const burgerBtn    = document.getElementById('burgerBtn');
    const mobMenu      = document.getElementById('mobMenu');
    const mobMenuClose = document.getElementById('mobMenuClose');

    function openMobMenu() {
        mobMenu?.classList.add('open');
        burgerBtn?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMobMenu() {
        mobMenu?.classList.remove('open');
        burgerBtn?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    burgerBtn?.addEventListener('click', openMobMenu);
    mobMenuClose?.addEventListener('click', closeMobMenu);
    // Закрыть по клику на ссылку
    mobMenu?.querySelectorAll('.mob-menu__link').forEach(l => l.addEventListener('click', closeMobMenu));
    // Закрыть по Escape
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobMenu(); });

    /* ============================================================
       4. БЕГУЩАЯ СТРОКА (infinite horizontal ticker)
       ============================================================ */
    const tickerTrack = document.getElementById('tickerTrack');

    function initTicker() {
        if (!tickerTrack) return;

        // Дублируем содержимое для бесшовного зацикливания
        const original = tickerTrack.innerHTML;
        tickerTrack.innerHTML = original + original;

        // Скорость: пикселей в секунду
        const PX_PER_SEC = 120;
        const totalWidth = tickerTrack.scrollWidth / 2; // ширина одного набора
        const duration   = totalWidth / PX_PER_SEC;

        tickerTrack.style.setProperty('--ticker-duration', `${duration}s`);

        // Пауза при наведении
        tickerTrack.parentElement?.addEventListener('mouseenter', () => {
            tickerTrack.style.animationPlayState = 'paused';
        });
        tickerTrack.parentElement?.addEventListener('mouseleave', () => {
            tickerTrack.style.animationPlayState = 'running';
        });
    }

    // Ждём загрузки шрифтов, чтобы ширина была точной
    if (document.fonts?.ready) {
        document.fonts.ready.then(initTicker);
    } else {
        window.addEventListener('load', initTicker);
    }

    /* ============================================================
       5. ФОРМА + МАСКА ТЕЛЕФОНА
       ============================================================ */
    const contactForm = document.getElementById('contactForm');
    const cfPhone     = document.getElementById('cfPhone');
    const cfSubmit    = document.getElementById('cfSubmit');
    const cfName      = document.getElementById('cfName');

    /* --- Маска телефона: +7 (___) ___ __-__ --- */
    function formatPhone(raw) {
        let digits = raw.replace(/\D/g, '');
        // Нормализуем к 7XXXXXXXXXX
        if (digits.length === 0) return '';
        if (digits[0] === '8') digits = '7' + digits.slice(1);
        if (digits[0] !== '7') digits = '7' + digits;
        digits = digits.slice(0, 11);

        const d = digits.slice(1);
        let out = '+7';
        if (d.length > 0)  out += ' (' + d.slice(0, 3);
        if (d.length >= 3) out += ') ' + d.slice(3, 6);
        if (d.length >= 6) out += ' '  + d.slice(6, 8);
        if (d.length >= 8) out += '-'  + d.slice(8, 10);
        return out;
    }

    if (cfPhone) {
        cfPhone.addEventListener('input', (e) => {
            const pos    = e.target.selectionStart;
            const before = e.target.value.length;
            e.target.value = formatPhone(e.target.value);
            // Корректируем позицию курсора
            const diff = e.target.value.length - before;
            e.target.setSelectionRange(pos + diff, pos + diff);
        });
        cfPhone.addEventListener('keydown', (e) => {
            const allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
            if (!allowed.includes(e.key) && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
            }
        });
        cfPhone.addEventListener('focus', () => {
            if (!cfPhone.value) cfPhone.value = '+7 (';
        });
        cfPhone.addEventListener('blur', () => {
            if (cfPhone.value === '+7 (' || cfPhone.value === '+7') cfPhone.value = '';
        });
    }

    /* --- Отправка формы --- */
    const modalThanks      = document.getElementById('modalThanks');
    const modalThanksClose = document.getElementById('modalThanksClose');

    function showThanks() {
        if (!modalThanks) return;
        modalThanks.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeThanks() {
        if (!modalThanks) return;
        modalThanks.classList.remove('open');
        document.body.style.overflow = '';
    }

    modalThanksClose?.addEventListener('click', closeThanks);
    modalThanks?.addEventListener('click', e => { if (e.target === modalThanks) closeThanks(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeThanks(); });

    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            name:  cfName?.value.trim()  || '',
            phone: cfPhone?.value.trim() || '',
        };

        if (!payload.name || !payload.phone) return;

        if (cfSubmit) {
            cfSubmit.disabled = true;
            cfSubmit.textContent = 'Отправляем…';
        }

        try {
            const res = await fetch('/api/lead', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('server');
        } catch {
            // Fallback: в режиме демо показываем благодарность даже без сервера
        } finally {
            contactForm.reset();
            if (cfSubmit) {
                cfSubmit.disabled = false;
                cfSubmit.innerHTML = `Получить консультацию
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 10h14M11 4l6 6-6 6"/>
                    </svg>`;
            }
            showThanks();
        }
    });

    /* ============================================================
       6. АНИМАЦИЯ ПОЯВЛЕНИЯ (IntersectionObserver)
       ============================================================ */
    const revealTargets = document.querySelectorAll(
        '.stats-section__title, .stats-section__desc, ' +
        '.stats-col, .pcard, .scard, ' +
        '.industries-list__item, .contact-form-card, ' +
        '.practices-section__title, .services-section__title, ' +
        '.industries-left__title, .contact-section__title'
    );

    revealTargets.forEach((el, i) => {
        el.classList.add('reveal');
        // Небольшая ступенчатая задержка для сгруппированных элементов
        el.style.transitionDelay = `${(i % 8) * 0.06}s`;
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -48px 0px',
    });

    revealTargets.forEach(el => revealObserver.observe(el));

    /* ============================================================
       7. ПЛАВНЫЙ СКРОЛЛ (якорные ссылки внутри страницы)
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const id = anchor.getAttribute('href').slice(1);
            if (!id) return;
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top:      target.offsetTop - 80,
                    behavior: 'smooth',
                });
            }
        });
    });

});
