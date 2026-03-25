/**
 * ГРАНД — Главный JS-файл
 * Порядок инициализации:
 * 1. Прелоадер
 * 2. Липкий хедер (sticky header)
 * 3. Мобильное меню (hamburger)
 * 4. Модальное окно + маска телефона + валидация
 * 5. Анимации появления (Intersection Observer)
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ====================================================
       1. ПРЕЛОАДЕР
       ==================================================== */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Скрываем прелоадер после загрузки страницы + небольшой задержки
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 1500);
        });
    }

    /* ====================================================
       2. ЛИПКИЙ ХЕДЕР — добавляем класс при прокрутке
       ==================================================== */
    const header = document.getElementById('header');
    let lastScrollY = 0;

    function handleHeaderScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    /* Подсветка активного пункта меню при прокрутке */
    const navLinks = document.querySelectorAll('.header__nav a');
    const sections = document.querySelectorAll('main section[id]');

    function updateActiveNavLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });

    /* ====================================================
       3. МОБИЛЬНОЕ МЕНЮ
       ==================================================== */
    const burgerBtn     = document.getElementById('burgerBtn');
    const mobileMenu    = document.getElementById('mobileMenu');
    const mobileClose   = document.getElementById('mobileMenuClose');
    const mobileLinks   = document.querySelectorAll('.mobile-link');

    function openMobileMenu() {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (burgerBtn) burgerBtn.addEventListener('click', openMobileMenu);
    if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);

    // Закрываем меню при клике на ссылку
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    /* ====================================================
       4. МОДАЛЬНОЕ ОКНО ОБРАТНОГО ЗВОНКА
       ==================================================== */
    const modalOverlay  = document.getElementById('modalOverlay');
    const modalClose    = document.getElementById('modalClose');
    const callbackForm  = document.getElementById('callbackForm');
    const submitBtn     = document.getElementById('submitBtn');

    // Кнопки, открывающие модал
    const callbackTriggers = [
        document.getElementById('btnCallback'),
        document.getElementById('heroBtnCallback'),
        document.getElementById('mobileBtnCallback'),
    ];

    function openModal() {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Фокус на первое поле
        setTimeout(() => {
            const firstInput = modalOverlay.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    callbackTriggers.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            closeMobileMenu();
            openModal();
        });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);

    // Закрытие по клику на оверлей (не на само модальное окно)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', e => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            closeThankYou();
        }
    });

    /* ---- Маска телефона: +7 (___) ___ __-__ ---- */
    const phoneInput = document.getElementById('fieldPhone');

    function applyPhoneMask(e) {
        const input = e.target;
        let digits = input.value.replace(/\D/g, '');

        // Всегда начинаем с 7
        if (digits.length === 0) {
            input.value = '';
            return;
        }
        // Если пользователь ввёл 8 в начале — заменяем на 7
        if (digits[0] === '8') digits = '7' + digits.slice(1);
        if (digits[0] !== '7') digits = '7' + digits;

        // Обрезаем до 11 цифр
        digits = digits.slice(0, 11);

        const d = digits.slice(1); // убираем ведущую 7
        let formatted = '+7';
        if (d.length > 0) formatted += ' (' + d.slice(0, 3);
        if (d.length >= 3) formatted += ') ' + d.slice(3, 6);
        if (d.length >= 6) formatted += ' ' + d.slice(6, 8);
        if (d.length >= 8) formatted += '-' + d.slice(8, 10);

        input.value = formatted;
    }

    function handlePhoneKeydown(e) {
        const input = e.target;
        // Разрешаем служебные клавиши
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (allowedKeys.includes(e.key)) return;
        // Запрещаем нецифровые символы
        if (!/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', applyPhoneMask);
        phoneInput.addEventListener('keydown', handlePhoneKeydown);
        // При фокусе ставим +7 если поле пустое
        phoneInput.addEventListener('focus', () => {
            if (!phoneInput.value) phoneInput.value = '+7 (';
        });
        phoneInput.addEventListener('blur', () => {
            if (phoneInput.value === '+7 (' || phoneInput.value === '+7') {
                phoneInput.value = '';
            }
        });
    }

    /* ---- Валидация формы — кнопка активна только при заполнении всех полей ---- */
    const formFields = callbackForm ? callbackForm.querySelectorAll('input[required]') : [];

    function validateForm() {
        if (!callbackForm) return;
        let allFilled = true;
        formFields.forEach(field => {
            const val = field.value.trim();
            if (!val) {
                allFilled = false;
                return;
            }
            // Дополнительная валидация email
            if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                allFilled = false;
            }
            // Валидация телефона: минимум 17 символов после форматирования (+7 (XXX) XXX XX-XX)
            if (field.type === 'tel' && val.replace(/\D/g, '').length < 11) {
                allFilled = false;
            }
        });
        submitBtn.disabled = !allFilled;
    }

    formFields.forEach(field => {
        field.addEventListener('input', validateForm);
        field.addEventListener('blur', () => {
            // Подсвечиваем невалидное поле при потере фокуса
            if (!field.value.trim()) {
                field.classList.add('invalid');
            } else {
                field.classList.remove('invalid');
            }
        });
    });

    /* ---- Отправка формы ---- */
    const thankYouOverlay = document.getElementById('thankYouOverlay');
    const thankYouClose   = document.getElementById('thankYouClose');

    function closeThankYou() {
        if (thankYouOverlay) {
            thankYouOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (thankYouClose) thankYouClose.addEventListener('click', closeThankYou);
    if (thankYouOverlay) {
        thankYouOverlay.addEventListener('click', e => {
            if (e.target === thankYouOverlay) closeThankYou();
        });
    }

    if (callbackForm) {
        callbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                firstName:  document.getElementById('fieldFirstName').value.trim(),
                lastName:   document.getElementById('fieldLastName').value.trim(),
                middleName: document.getElementById('fieldMiddleName').value.trim(),
                phone:      document.getElementById('fieldPhone').value.trim(),
                email:      document.getElementById('fieldEmail').value.trim(),
            };

            // Блокируем кнопку во время отправки
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправляем...';

            try {
                /* Отправка на бекенд (Python/Flask или FastAPI) */
                const response = await fetch('/api/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    closeModal();
                    callbackForm.reset();
                    submitBtn.textContent = 'Отправить заявку';
                    // Показываем «Спасибо»
                    setTimeout(() => {
                        thankYouOverlay.classList.add('open');
                        document.body.style.overflow = 'hidden';
                    }, 200);
                } else {
                    throw new Error('Ошибка сервера');
                }
            } catch {
                // Fallback: показываем «Спасибо» даже без бекенда (режим демо)
                closeModal();
                callbackForm.reset();
                submitBtn.textContent = 'Отправить заявку';
                setTimeout(() => {
                    thankYouOverlay.classList.add('open');
                    document.body.style.overflow = 'hidden';
                }, 200);
            }
        });
    }

    /* ====================================================
       5. АНИМАЦИИ ПОЯВЛЕНИЯ — Intersection Observer
       ==================================================== */
    const fadeEls = document.querySelectorAll(
        '.stat-card, .practice-card, .service-card, .industries__item, ' +
        '.about__title, .practices__title, .industries__title, .services__title, ' +
        '.hero__title, .hero__desc'
    );

    // Добавляем класс fade-up всем целевым элементам
    fadeEls.forEach((el, i) => {
        el.classList.add('fade-up');
        el.style.transitionDelay = `${(i % 6) * 0.07}s`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
    });

    fadeEls.forEach(el => observer.observe(el));

    /* ====================================================
       ПЛАВНЫЙ СКРОЛЛ — переопределяем якорные ссылки
       ==================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href').slice(1);
            if (!targetId) return;
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                const offset = target.offsetTop - 90;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        });
    });

});
