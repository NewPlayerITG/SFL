const btnBack = document.getElementById('btn-back');
const calendarModal = document.getElementById('calendar-modal');
const calendarMonthYear = document.getElementById('calendar-month-year');
const calendarDaysContainer = document.getElementById('calendar-days');
const wheelHours = document.getElementById('wheel-hours');
const wheelMinutes = document.getElementById('wheel-minutes');
const inputHours = document.getElementById('input-hours');
const inputMinutes = document.getElementById('input-minutes');
const toast = document.getElementById('toast-notification');

const authModal = document.getElementById('auth-modal');
const viewLogin = document.getElementById('auth-view-login');
const viewRegister = document.getElementById('auth-view-register');
const viewProfile = document.getElementById('auth-view-profile');
const profileLabel = document.getElementById('profile-label');
const profileGreeting = document.getElementById('profile-greeting');

const calendarViewModeEl = document.getElementById('calendar-view-mode');
const calendarEditModeEl = document.getElementById('calendar-edit-mode');
const eventDetailsText = document.getElementById('event-details-text');

let historyStack = [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDay = null; 
let currentCalendarMode = 'view'; 

let toastTimer = null; 
let hoursResetTimeout = null;
let minutesResetTimeout = null;

const monthsRu = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
const monthsRuTitle = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабря"];

window.addEventListener('DOMContentLoaded', () => {
    buildInfiniteWheels();
    updateProfileUI(); 
    setupWheelDragAndType(wheelHours, inputHours, 24);
    setupWheelDragAndType(wheelMinutes, inputMinutes, 60);
});

// АВТОРИЗАЦИЯ И ЛОКАЛЬНАЯ БАЗА ДАННЫХ
function getUsersDB() { return JSON.parse(localStorage.getItem('users_db')) || []; }
function saveUsersDB(db) { localStorage.setItem('users_db', JSON.stringify(db)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('current_user')) || null; }
function setCurrentUser(user) { localStorage.setItem('current_user', JSON.stringify(user)); }

function openAuthModal() {
    authModal.classList.remove('hidden');
    const user = getCurrentUser();
    if (user) { switchAuthView('profile'); } else { switchAuthView('login'); }
}
function closeAuthModal() { authModal.classList.add('hidden'); }
function closeAuthOverlay(event) { if (event.target === authModal) closeAuthModal(); }

function switchAuthView(viewName) {
    viewLogin.classList.add('hidden'); viewRegister.classList.add('hidden'); viewProfile.classList.add('hidden');
    if (viewName === 'login') viewLogin.classList.remove('hidden');
    if (viewName === 'register') viewRegister.classList.remove('hidden');
    if (viewName === 'profile') {
        const user = getCurrentUser();
        profileGreeting.innerText = `Привет, ${user ? user.name : 'Пользователь'}!`;
        viewProfile.classList.remove('hidden');
    }
}

function updateProfileUI() {
    const user = getCurrentUser();
    if (user) {
        profileLabel.innerText = user.name;
        profileLabel.classList.remove('hidden');
    } else {
        profileLabel.classList.add('hidden');
    }
}

function handleLoginSubmit() {
    const userInp = document.getElementById('login-username').value.trim();
    const passInp = document.getElementById('login-password').value;
    const db = getUsersDB();
    const foundUser = db.find(u => u.username.toLowerCase() === userInp.toLowerCase() && u.password === passInp);

    if (foundUser) {
        setCurrentUser(foundUser);
        updateProfileUI();
        showToast(`Добро пожаловать, ${foundUser.name}!`);
        closeAuthModal();
        document.getElementById('login-username').value = ''; document.getElementById('login-password').value = '';
    } else {
        const activeBox = document.getElementById('auth-view-login');
        document.body.classList.add('error-bg');
        activeBox.classList.add('shake-animation');
        setTimeout(() => { document.body.classList.remove('error-bg'); activeBox.classList.remove('shake-animation'); }, 1000);
    }
}

function handleRegisterSubmit() {
    const userInp = document.getElementById('reg-username').value.trim();
    const passInp = document.getElementById('reg-password').value;
    const nameInp = document.getElementById('reg-name').value.trim();

    if (!userInp || !passInp || !nameInp) { showToast("Заполните все поля!"); return; }

    const db = getUsersDB();
    if (db.some(u => u.username.toLowerCase() === userInp.toLowerCase())) {
        showToast("Логин уже занят. Придумайте другой"); return;
    }

    const newUser = { username: userInp, password: passInp, name: nameInp, savedDates: {} };
    db.push(newUser); saveUsersDB(db); setCurrentUser(newUser); updateProfileUI();
    showToast("Регистрация успешна!"); closeAuthModal();
    document.getElementById('reg-username').value = ''; document.getElementById('reg-password').value = ''; document.getElementById('reg-name').value = '';
}

function handleLogout() {
    localStorage.removeItem('current_user');
    updateProfileUI(); selectedDay = null; showToast("Вы вышли из системы"); closeAuthModal();
}

// НАВИГАЦИЯ ЭКРАНОВ
function navigate(targetScreenId) {
    const currentScreen = document.querySelector('.screen:not(.hidden)');
    if (currentScreen) { historyStack.push(currentScreen.id); currentScreen.classList.add('hidden'); }
    const targetScreen = document.getElementById(targetScreenId);
    targetScreen.classList.remove('hidden');
    updateBackButton(targetScreenId);
}

function goBack() {
    if (historyStack.length === 0) return;
    const currentScreen = document.querySelector('.screen:not(.hidden)');
    if (currentScreen) currentScreen.classList.add('hidden');
    const previousScreenId = historyStack.pop();
    const previousScreen = document.getElementById(previousScreenId);
    previousScreen.classList.remove('hidden');
    updateBackButton(previousScreenId);
}

function updateBackButton(currentScreenId) {
    if (currentScreenId === 'screen-main' || currentScreenId === 'screen-finish') {
        btnBack.classList.add('hidden');
    } else {
        btnBack.classList.remove('hidden');
    }
}

// КАЛЕНДАРЬ И СОБЫТИЯ
function openCalendar(mode = 'view') {
    currentCalendarMode = mode;
    calendarModal.classList.remove('hidden');
    closeAuthModal();
    
    if (mode === 'edit') {
        calendarEditModeEl.classList.remove('hidden');
        calendarViewModeEl.classList.add('hidden');
        setTimeout(centerTimeWheels, 50);
    } else {
        calendarEditModeEl.classList.add('hidden');
        calendarViewModeEl.classList.remove('hidden');
        eventDetailsText.innerHTML = "Выберите день, чтобы посмотреть планы.";
    }
    selectedDay = null; renderCalendar();
}

function closeCalendar() { calendarModal.classList.add('hidden'); }
function closeCalendarOverlay(event) { if (event.target === calendarModal) closeCalendar(); }

function renderCalendar() {
    calendarMonthYear.innerText = `${monthsRuTitle[currentMonth]} ${currentYear}`;
    calendarDaysContainer.innerHTML = '';

    let firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    let startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const user = getCurrentUser();

    for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('empty');
        calendarDaysContainer.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.innerText = day;
        const dateKey = `${currentYear}-${currentMonth}-${day}`;

        if (user && user.savedDates && user.savedDates[dateKey]) { dayCell.classList.add('saved-date'); } 
        else if (day === selectedDay && currentCalendarMode === 'edit') { dayCell.classList.add('selected-date'); }

        dayCell.onclick = () => {
            selectedDay = day; renderCalendar(); 
            if (currentCalendarMode === 'view') {
                if (user && user.savedDates && user.savedDates[dateKey]) {
                    eventDetailsText.innerHTML = `<strong>${day} ${monthsRu[currentMonth]}</strong>Запланировано событие на ${user.savedDates[dateKey]}`;
                } else {
                    eventDetailsText.innerHTML = `<strong>${day} ${monthsRu[currentMonth]}</strong>Свободный день! Планов нет.`;
                }
            }
        };
        calendarDaysContainer.appendChild(dayCell);
    }

    let totalCells = startDay + daysInMonth;
    for (let i = 0; i < (42 - totalCells); i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('empty');
        calendarDaysContainer.appendChild(emptyCell);
    }
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    selectedDay = null; 
    if (currentCalendarMode === 'view') eventDetailsText.innerHTML = "Выберите день, чтобы посмотреть планы.";
    renderCalendar();
}

function resetDateSelection() {
    if (selectedDay === null) { showToast("Выберите конкретный день для очистки"); return; }
    const user = getCurrentUser(); const dateKey = `${currentYear}-${currentMonth}-${selectedDay}`;

    if (user && user.savedDates && user.savedDates[dateKey]) {
        delete user.savedDates[dateKey]; setCurrentUser(user);
        const db = getUsersDB(); const uIdx = db.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
        if (uIdx !== -1) { db[uIdx].savedDates = user.savedDates; saveUsersDB(db); }
        showToast("Событие удалено из календаря");
    } else { showToast("На этот день нет событий"); }
    selectedDay = null; renderCalendar(); closeCalendar();
}

function saveDateSelection() {
    if (selectedDay === null) { showToast("Сначала выберите день!"); return; }
    const hEl = wheelHours.querySelector('.active-time'); const mEl = wheelMinutes.querySelector('.active-time');
    const timeStr = `${hEl ? hEl.innerText : "00"}:${mEl ? mEl.innerText : "00"}`;
    const user = getCurrentUser(); const dateKey = `${currentYear}-${currentMonth}-${selectedDay}`;

    if (user) {
        if (!user.savedDates) user.savedDates = {};
        user.savedDates[dateKey] = timeStr; setCurrentUser(user);
        const db = getUsersDB(); const uIdx = db.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
        if (uIdx !== -1) { db[uIdx].savedDates = user.savedDates; saveUsersDB(db); }
        showToast(`Сохранено! (${selectedDay} ${monthsRu[currentMonth]} в ${timeStr})`);
    } else { showToast(`Дата сохранена временно. Войдите в аккаунт!`); }
    selectedDay = null; renderCalendar(); closeCalendar();
}

function showToast(message) {
    toast.innerText = message; toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 5000);
}

// БЕСКОНЕЧНЫЕ КОЛЕСИКИ ВРЕМЕНИ
function buildInfiniteWheels() {
    let hoursHTML = '<div></div>';
    for (let loop = 0; loop < 3; loop++) { for (let i = 0; i < 24; i++) { let str = i < 10 ? '0' + i : i; hoursHTML += `<div data-val="${i}">${str}</div>`; } }
    hoursHTML += '<div></div>'; wheelHours.innerHTML = hoursHTML;

    let minutesHTML = '<div></div>';
    for (let loop = 0; loop < 3; loop++) { for (let i = 0; i < 60; i++) { let str = i < 10 ? '0' + i : i; minutesHTML += `<div data-val="${i}">${str}</div>`; } }
    minutesHTML += '<div></div>'; wheelMinutes.innerHTML = minutesHTML;

    wheelHours.onscroll = () => { handleActiveHighlight(wheelHours); clearTimeout(hoursResetTimeout); hoursResetTimeout = setTimeout(() => { handleInfiniteScrollLoop(wheelHours, 24); }, 100); };
    wheelMinutes.onscroll = () => { handleActiveHighlight(wheelMinutes); clearTimeout(minutesResetTimeout); minutesResetTimeout = setTimeout(() => { handleInfiniteScrollLoop(wheelMinutes, 60); }, 100); };
}

function handleInfiniteScrollLoop(wheel, maxVal) {
    const itemHeight = 30; const currentScroll = wheel.scrollTop; const midSectionStart = maxVal * itemHeight;
    if (currentScroll < itemHeight * 4) { wheel.scrollTop = currentScroll + midSectionStart; }
    else if (currentScroll > midSectionStart * 2) { wheel.scrollTop = currentScroll - midSectionStart; }
}

function handleActiveHighlight(wheel) {
    const items = wheel.querySelectorAll('div[data-val]');
    const wheelCenter = wheel.getBoundingClientRect().top + wheel.getBoundingClientRect().height / 2;
    let closestItem = null; let minDistance = Infinity;

    items.forEach(item => {
        const itemCenter = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
        const distance = Math.abs(wheelCenter - itemCenter);
        item.classList.remove('active-time');
        if (distance < minDistance) { minDistance = distance; closestItem = item; }
    });
    if (closestItem) closestItem.classList.add('active-time');
}

function centerTimeWheels() {
    const itemHeight = 30; wheelHours.scrollTop = 24 * itemHeight; wheelMinutes.scrollTop = 60 * itemHeight;
    handleActiveHighlight(wheelHours); handleActiveHighlight(wheelMinutes);
}

function setupWheelDragAndType(wheel, input, maxVal) {
    let isDown = false; let startY, scrollTop, hasDragged = false;
    wheel.addEventListener('mousedown', (e) => { isDown = true; hasDragged = false; wheel.style.scrollSnapType = 'none'; startY = e.pageY - wheel.offsetTop; scrollTop = wheel.scrollTop; });
    wheel.addEventListener('mouseleave', () => { if (isDown) { isDown = false; wheel.style.scrollSnapType = 'y mandatory'; } });
    wheel.addEventListener('mouseup', () => { if (isDown) { isDown = false; wheel.style.scrollSnapType = 'y mandatory'; const current = wheel.scrollTop; wheel.scrollTop = current + 1; wheel.scrollTop = current; } });
    wheel.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const y = e.pageY - wheel.offsetTop; const walk = (y - startY) * 1.5; if (Math.abs(walk) > 3) hasDragged = true; wheel.scrollTop = scrollTop - walk; });
    wheel.addEventListener('click', () => { if (hasDragged) return; const active = wheel.querySelector('.active-time'); input.value = active ? active.innerText : "00"; input.classList.remove('hidden'); input.focus(); input.select(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
    input.addEventListener('blur', () => {
        let val = parseInt(input.value, 10); if (isNaN(val) || val < 0) val = 0; if (val >= maxVal) val = maxVal - 1;
        input.classList.add('hidden'); const itemHeight = 30; wheel.scrollTop = (maxVal + val) * itemHeight;
        setTimeout(() => handleActiveHighlight(wheel), 20);
    });
}

// ТОЧНАЯ БАЗА ДАННЫХ ЦВЕТОВ (Использует файлы 1.jpg - 18.jpg из твоей папки images)
const flowersData = [
    { id: 1, name: "Кустовая роза", shortDesc: "Изящное соцветие", longDesc: "Пышные кустовые розы, создающие ощущение праздничной лёгкости и уюта.", image: "images/1.jpg" },
    { id: 2, name: "Гвоздика", shortDesc: "Классическая стойкость", longDesc: "Стойкие и изящные цветы с богатой палитрой оттенков.", image: "images/2.jpg" },
    { id: 3, name: "Альстромерия", shortDesc: "Перуанская лилия", longDesc: "Яркие и нежные лепестки, которые долго сохраняют свежесть.", image: "images/3.jpg" },
    { id: 4, name: "Георгин", shortDesc: "Осеннее великолепие", longDesc: "Крупные, геометрически идеальные бутоны для роскошных композиций.", image: "images/4.jpg" },
    { id: 5, name: "Гортензия", shortDesc: "Облако нежности", longDesc: "Объемное соцветие, напоминающее лёгкое воздушное облако.", image: "images/5.jpg" },
    { id: 6, name: "Лилия", shortDesc: "Королевский шарм", longDesc: "Благородный цветок с утончённым силуэтом и глубоким ароматом.", image: "images/6.jpg" },
    { id: 7, name: "Мимоза", shortDesc: "Весеннее солнце", longDesc: "Яркие пушистые соцветия, дарящие весеннее тепло и радость.", image: "images/7.jpg" },
    { id: 8, name: "Пионы", shortDesc: "Пышный шик", longDesc: "Невероятно востребованные и ароматные многослойные бутоны.", image: "images/8.jpg" },
    { id: 9, name: "Подсолнух", shortDesc: "Энергия солнца", longDesc: "Яркий, жизнерадостный цветок, привносящий позитив в любой дом.", image: "images/9.jpg" },
    { id: 10, name: "Протея", shortDesc: "Экзотический центр", longDesc: "Уникальный доминантный цветок для ценителей высокой флористики.", image: "images/10.jpg" },
    { id: 11, name: "Одноголовая роза", shortDesc: "Классический выбор", longDesc: "Идеальный крупный бутон на высоком элегантном стебле.", image: "images/11.jpg" },
    { id: 12, name: "Пионовидная роза", shortDesc: "Французский стиль", longDesc: "Изысканное сочетание классической розы и пышной текстуры пиона.", image: "images/12.jpg" },
    { id: 13, name: "Ромашка", shortDesc: "Полевая искренность", longDesc: "Милые садовые ромашки, создающие атмосферу тепла и уюта.", image: "images/13.jpg" },
    { id: 14, name: "Сирень", shortDesc: "Весенний шлейф", longDesc: "Пышные ароматные веточки с незабываемым ностальгическим запахом.", image: "images/14.jpg" },
    { id: 15, name: "Тюльпан", shortDesc: "Свежесть утра", longDesc: "Хрустящие сочные стебли и нежные классические бутоны.", image: "images/15.jpg" },
    { id: 16, name: "Хризантема", shortDesc: "Абсолютная стойкость", longDesc: "Пышный цветок, способный оставаться свежим в вазе рекордное время.", image: "images/16.jpg" },
    { id: 17, name: "Экзотика", shortDesc: "Тропический микс", longDesc: "Редкие декоративные растения для самых необычных букетов.", image: "images/17.jpg" },
    { id: 18, name: "Букет", shortDesc: "Авторская сборка", longDesc: "Гармоничная композиция, собранная профессиональным флористом.", image: "images/18.jpg" }
];

function renderFlowersGallery() {
    const galleryContainer = document.getElementById('flowers-gallery');
    if (!galleryContainer) return;

    let html = '';
    flowersData.forEach(flower => {
        // Формируем базовое имя без расширения, например: "images/1"
        const baseImagePath = `images/${flower.id}`; 
        
        html += `
            <div class="flower-card" onclick="openFlowerModal(${flower.id})">
                <img src="${baseImagePath}.jpg" 
                     alt="${flower.name}" 
                     class="flower-img"
                     onerror="if (this.src.endsWith('.jpg')) { this.src = '${baseImagePath}.png'; } 
                              else if (this.src.endsWith('.png')) { this.src = '${baseImagePath}.JPG'; }
                              else if (this.src.endsWith('.JPG')) { this.src = '${baseImagePath}.jpeg'; }">
                <div class="flower-overlay">
                    <h3>${flower.name}</h3>
                    <p>${flower.shortDesc}</p>
                </div>
            </div>
        `;
    });
    galleryContainer.innerHTML = html;
}

function openFlowersSection() {
    navigate('screen-flowers');
    renderFlowersGallery();
}

function openFlowerModal(flowerId) {
    const flower = flowersData.find(f => f.id === flowerId);
    if (!flower) return;
    
    const modalImg = document.getElementById('flower-modal-img');
    const baseImagePath = `images/${flower.id}`;
    
    // Задаем базовый старт
    modalImg.src = `${baseImagePath}.jpg`;
    
    // Дублируем логику перебора для модалки
    modalImg.onerror = function() {
        if (this.src.endsWith('.jpg')) { this.src = `${baseImagePath}.png`; } 
        else if (this.src.endsWith('.png')) { this.src = `${baseImagePath}.JPG`; }
        else if (this.src.endsWith('.JPG')) { this.src = `${baseImagePath}.jpeg`; }
        else { this.onerror = null; } // Останавливаем бесконечный цикл, если картинки вообще нет
    };

    document.getElementById('flower-modal-title').innerText = flower.name;
    document.getElementById('flower-modal-desc').innerText = flower.longDesc;
    document.getElementById('flower-modal').classList.remove('hidden');
}

function closeFlowerModal(event) {
    document.getElementById('flower-modal').classList.add('hidden');
}

function chooseFlowerAndGoToDate() {
    document.getElementById('flower-modal').classList.add('hidden');
    openCalendar('edit');
}