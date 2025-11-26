'use strict';

/* ============================================================
   1. КОНФІГУРАЦІЯ ТА СТАН
   ============================================================ */

const CONFIG = {
    storageKey: 'cv_ultra_final_v2', // Новий ключ, щоб очистити старі баги
    debounceDelay: 300
};

// Початковий стан
const initialState = {
    template: '', // Дизайн резюме
    personal: { 
        name: '', 
        title: '', 
        photo: '', 
        summary: '',
        // Налаштування фото (Зум і позиція)
        photoConfig: {
            zoom: 1,
            x: 0,
            y: 0
        }
    },
    contacts: { phone: '', email: '', address: '', linkedin: '' },
    jobs: [], // Масив робіт
    project: { name: '', stack: '', description: '' },
    education: { place: '', degree: '', time: '' },
    skills: '',
    languages: ''
};

// Завантаження стану
let appState = loadState() || initialState;

// ФІКС ДЛЯ СТАРИХ ДАНИХ: Якщо в збережених даних немає photoConfig, додаємо його
if (!appState.personal.photoConfig) {
    appState.personal.photoConfig = { zoom: 1, x: 0, y: 0 };
}

/* ============================================================
   2. ІНІЦІАЛІЗАЦІЯ
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    restoreFormFromState(); // Відновлюємо тексти
    renderJobInputs();      // Малюємо роботи в редакторі
    renderAll();            // Малюємо все резюме
    attachEventListeners(); // Підключаємо кнопки та інпути
    initTheme();            // Запускаємо тему
    initPhotoControls();    // Підключаємо слайдери фото
});

/* ============================================================
   3. ЛОГІКА ФОТО (ЗАВАНТАЖЕННЯ + РЕДАГУВАННЯ)
   ============================================================ */

const photoInput = document.getElementById('inp-photo');
const removePhotoBtn = document.getElementById('btn-remove-photo');
const photoControls = document.getElementById('photo-controls');

// Слайдери
const inpZoom = document.getElementById('inp-zoom');
const inpPosX = document.getElementById('inp-pos-x');
const inpPosY = document.getElementById('inp-pos-y');

function initPhotoControls() {
    // Слухач завантаження файлу
    if (photoInput) {
        photoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    appState.personal.photo = e.target.result;
                    // Скидаємо налаштування позиції при завантаженні нового фото
                    appState.personal.photoConfig = { zoom: 1, x: 0, y: 0 };
                    saveState();
                    renderAll();
                    restoreFormFromState(); // Оновлюємо повзунки в нуль
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Слухачі для слайдерів (Зум, X, Y)
    [inpZoom, inpPosX, inpPosY].forEach(input => {
        if(input) {
            input.addEventListener('input', () => {
                // Записуємо значення в стан
                appState.personal.photoConfig.zoom = parseFloat(inpZoom.value);
                appState.personal.photoConfig.x = parseInt(inpPosX.value);
                appState.personal.photoConfig.y = parseInt(inpPosY.value);
                
                saveState();
                updatePhotoStyle(); // Миттєве оновлення стилів
            });
        }
    });
}

// Функція застосування стилів до фото (CSS Transform)
function updatePhotoStyle() {
    const img = document.getElementById('out-photo');
    if (!img) return;

    const { zoom, x, y } = appState.personal.photoConfig;
    
    // Рухаємо картинку
    img.style.transform = `scale(${zoom}) translate(${x}px, ${y}px)`;
    
    // Важливо: якщо ми зумимо, треба дозволити картинці виходити за межі стандартного розміру
    if (zoom != 1 || x != 0 || y != 0) {
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'unset'; // Вимикаємо стандартне обрізання
    } else {
        img.style.objectFit = 'cover'; // Стандартний вигляд
    }
}

function removePhoto() {
    if(confirm('Видалити фото?')) {
        appState.personal.photo = '';
        appState.personal.photoConfig = { zoom: 1, x: 0, y: 0 };
        saveState();
        renderAll();
        if(photoInput) photoInput.value = '';
    }
}

/* ============================================================
   4. ЛОГІКА ТЕМИ (DARK MODE)
   ============================================================ */

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setTheme('dark');
    else setTheme('light');

    const btn = document.getElementById('theme-toggle');
    if(btn) btn.addEventListener('click', toggleTheme);
}

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        if (themeName === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

function toggleTheme() {
    const current = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
    setTheme(current);
}

/* ============================================================
   5. ЛОГІКА РОБІТ (JOBS)
   ============================================================ */

function addJob() {
    appState.jobs.push({
        id: Date.now(),
        company: '',
        position: '',
        time: '',
        description: ''
    });
    saveState();
    renderJobInputs();
    renderAll();
}

function deleteJob(id) {
    if(confirm('Видалити?')) {
        appState.jobs = appState.jobs.filter(j => j.id !== id);
        saveState();
        renderJobInputs();
        renderAll();
    }
}

function updateJobField(id, field, value) {
    const job = appState.jobs.find(j => j.id === id);
    if (job) {
        job[field] = value;
        saveState();
        renderAll();
    }
}

function validateAndSaveJob(id, field, inputElement) {
    const value = inputElement.value;
    updateJobField(id, field, value);
    
    // Валідація: тільки цифри, пробіли, тире, крапки
    const isValid = /^[0-9\s\-\.\/]*$/.test(value);
    
    if (!isValid) {
        inputElement.style.border = '1px solid #ef4444';
        inputElement.style.background = '#fef2f2';
    } else {
        inputElement.style.border = '';
        inputElement.style.background = '';
    }
}

function renderJobInputs() {
    const container = document.getElementById('jobs-editor-container');
    if(!container) return;
    container.innerHTML = '';

    appState.jobs.forEach((job, index) => {
        // Перевірка валідації при рендері
        const isPeriodInvalid = job.time && !/^[0-9\s\-\.\/]+$/.test(job.time);
        const errorStyle = isPeriodInvalid ? 'border: 1px solid red; background: #fff0f0;' : '';

        const html = `
            <div class="job-card">
                <button type="button" onclick="deleteJob(${job.id})" class="btn-delete"><i class="fa-solid fa-trash"></i></button>
                <h4>Місце роботи #${index + 1}</h4>
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="Компанія" value="${job.company}" oninput="updateJobField(${job.id}, 'company', this.value)">
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="Посада" value="${job.position}" oninput="updateJobField(${job.id}, 'position', this.value)">
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="Період (2021-2023)" value="${job.time}" style="${errorStyle}" oninput="validateAndSaveJob(${job.id}, 'time', this)">
                </div>
                <div class="form-group">
                    <textarea class="form-control" rows="3" placeholder="Обов'язки..." oninput="updateJobField(${job.id}, 'description', this.value)">${job.description}</textarea>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function renderJobsPreview() {
    const container = document.getElementById('out-jobs-container');
    if(!container) return;
    container.innerHTML = '';

    appState.jobs.forEach(job => {
        const dateHTML = job.time ? `<div class="exp-date">${job.time}</div>` : '';
        const descHTML = job.description ? `<div class="exp-desc"><p>${job.description}</p></div>` : '';

        const html = `
            <div class="experience-item">
                <div class="exp-header">
                    <h4 class="exp-position">${job.position || 'Посада'}</h4>
                    <span class="exp-company">${job.company || 'Компанія'}</span>
                </div>
                ${dateHTML}
                ${descHTML}
            </div>`;
        container.insertAdjacentHTML('beforeend', html);
    });
}

/* ============================================================
   6. ГОЛОВНИЙ RENDER
   ============================================================ */

function renderAll() {
    setText('out-name', appState.personal.name, 'ВАШЕ ІМ\'Я');
    setText('out-title', appState.personal.title, 'Ваша Посада');
    setText('out-summary', appState.personal.summary, 'Напишіть коротко про себе...');
    
    // Фото
    const photoImg = document.getElementById('out-photo');
    if (appState.personal.photo) {
        photoImg.src = appState.personal.photo;
        photoImg.style.display = 'block';
        if(removePhotoBtn) removePhotoBtn.style.display = 'block';
        if(photoControls) photoControls.style.display = 'block';
        
        // Застосовуємо стилі позиції
        updatePhotoStyle();
    } else {
        photoImg.style.display = 'none';
        if(removePhotoBtn) removePhotoBtn.style.display = 'none';
        if(photoControls) photoControls.style.display = 'none';
    }

    setText('out-phone', appState.contacts.phone, '+380 XX XXX XX XX');
    setText('out-email', appState.contacts.email, 'email@example.com');
    setText('out-address', appState.contacts.address, 'Місто, Країна');
    toggleBlock('li-linkedin', appState.contacts.linkedin);
    if(appState.contacts.linkedin) document.getElementById('out-linkedin').innerText = appState.contacts.linkedin;

    renderJobsPreview();

    const projSection = document.getElementById('sec-projects');
    if (appState.project.name) {
        projSection.style.display = 'block';
        setText('out-proj-name', appState.project.name);
        setText('out-proj-stack', appState.project.stack, 'Stack');
        setText('out-proj-desc', appState.project.description);
    } else {
        projSection.style.display = 'none';
    }

    setText('out-edu-place', appState.education.place, 'Навчальний заклад');
    setText('out-edu-degree', appState.education.degree, 'Спеціальність');
    setText('out-edu-time', appState.education.time, 'Роки навчання');

    renderList('out-skills-list', appState.skills);
    renderList('out-lang-list', appState.languages);
}

/* ============================================================
   7. ДОПОМІЖНІ ФУНКЦІЇ
   ============================================================ */

function saveState() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(appState));
}

function loadState() {
    const data = localStorage.getItem(CONFIG.storageKey);
    return data ? JSON.parse(data) : undefined;
}

function resetForm() {
    if (confirm('Очистити все?')) {
        localStorage.removeItem(CONFIG.storageKey);
        location.reload();
    }
}

function setText(id, value, placeholder = '') {
    const el = document.getElementById(id);
    if (el) el.innerText = value || placeholder;
}

function toggleBlock(id, value) {
    const el = document.getElementById(id);
    if (el) el.style.display = value ? 'flex' : 'none';
}

function renderList(elementId, dataString) {
    const container = document.getElementById(elementId);
    if(!container) return;
    container.innerHTML = '';
    if (!dataString) return;
    
    dataString.split(',').forEach(item => {
        if (item.trim()) {
            const li = document.createElement('li');
            li.textContent = item.trim();
            container.appendChild(li);
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function bind(id, group, key) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', debounce((e) => {
        appState[group][key] = e.target.value;
        saveState();
        renderAll();
    }, CONFIG.debounceDelay));
}

function bindSimple(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', debounce((e) => {
        appState[key] = e.target.value;
        saveState();
        renderAll();
    }, CONFIG.debounceDelay));
}

function attachEventListeners() {
    bind('inp-name', 'personal', 'name');
    bind('inp-title', 'personal', 'title');
    bind('inp-summary', 'personal', 'summary');

    bind('inp-phone', 'contacts', 'phone');
    bind('inp-email', 'contacts', 'email');
    bind('inp-address', 'contacts', 'address');
    bind('inp-linkedin', 'contacts', 'linkedin');

    bind('inp-proj-name', 'project', 'name');
    bind('inp-proj-stack', 'project', 'stack');
    bind('inp-proj-desc', 'project', 'description');

    bind('inp-edu-place', 'education', 'place');
    bind('inp-edu-degree', 'education', 'degree');
    bind('inp-edu-time', 'education', 'time');

    bindSimple('inp-skills', 'skills');
    bindSimple('inp-languages', 'languages');
}

function restoreFormFromState() {
    document.getElementById('inp-name').value = appState.personal.name;
    document.getElementById('inp-title').value = appState.personal.title;
    document.getElementById('inp-summary').value = appState.personal.summary;

    document.getElementById('inp-phone').value = appState.contacts.phone;
    document.getElementById('inp-email').value = appState.contacts.email;
    document.getElementById('inp-address').value = appState.contacts.address;
    document.getElementById('inp-linkedin').value = appState.contacts.linkedin;

    document.getElementById('inp-proj-name').value = appState.project.name;
    document.getElementById('inp-proj-stack').value = appState.project.stack;
    document.getElementById('inp-proj-desc').value = appState.project.description;

    document.getElementById('inp-edu-place').value = appState.education.place;
    document.getElementById('inp-edu-degree').value = appState.education.degree;
    document.getElementById('inp-edu-time').value = appState.education.time;

    document.getElementById('inp-skills').value = appState.skills;
    document.getElementById('inp-languages').value = appState.languages;

    // Відновлення повзунків фото
    if (appState.personal.photoConfig && inpZoom) {
        inpZoom.value = appState.personal.photoConfig.zoom;
        inpPosX.value = appState.personal.photoConfig.x;
        inpPosY.value = appState.personal.photoConfig.y;
    }
}

function validateBeforePrint() {
    let errors = [];
    if (!appState.personal.name.trim()) errors.push("Ім'я");
    if (!appState.contacts.phone.trim() && !appState.contacts.email.trim()) errors.push("Телефон або Email");

    if (errors.length > 0) {
        alert("Заповніть: " + errors.join(", "));
        return false;
    }
    return true;
}

function printResume() {
    if (validateBeforePrint()) {
        window.print();
    }
}

/* ============================================================
   8. ЛОГІКА ЗМІНИ ШАБЛОНІВ (TEMPLATES)
   ============================================================ */

const templateSelector = document.getElementById('template-selector');
const resumePaper = document.getElementById('resume-preview');

if (templateSelector) {
    // 1. Слухаємо зміну вибору
    templateSelector.addEventListener('change', (e) => {
        const selectedTemplate = e.target.value;
        
        // Зберігаємо в стан
        appState.template = selectedTemplate;
        saveState();
        
        // Застосовуємо клас
        applyTemplate(selectedTemplate);
    });
}

// Функція застосування класу
function applyTemplate(templateName) {
    // Спочатку скидаємо всі класи шаблонів, залишаємо тільки 'resume-paper'
    resumePaper.className = 'resume-paper';
    
    // Якщо вибрано якийсь шаблон, додаємо його клас
    if (templateName) {
        resumePaper.classList.add(templateName);
    }
}

// Додай цей виклик у функцію restoreFormFromState(), щоб шаблон відновлювався при F5
// Знайди функцію restoreFormFromState і додай в кінець:
/*
    if (appState.template && templateSelector) {
        templateSelector.value = appState.template;
        applyTemplate(appState.template);
    }
*/