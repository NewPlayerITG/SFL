const btnBack = document.getElementById('btn-back');
const toast = document.getElementById('toast-notification');
let historyStack = [];
let toastTimer = null; 
let selectedContextItem = ""; 

// --- 1. БАЗЫ ДАННЫХ ---
const walkPlaces = [
    "Красная площадь", "Аптекарский огород", "Парк Горького", "ВДНХ", 
    "Парк Зарядье", "Чистые пруды", "Старый Арбат", "Парк Музеон", 
    "Царицыно", "Парк Сокольники"
];

const mallsList = [
    { name: "Авиапарк", address: "Ходынский бульвар, 4" },
    { name: "Хорошо!", address: "Хорошёвское шоссе, 27" },
    { name: "Европейский", address: "пл. Киевского Вокзала, 2" },
    { name: "Метрополис", address: "Ленинградское шоссе, 16А стр 4" },
    { name: "Афимолл Сити", address: "Пресненская набережная, 2" },
    { name: "Охотный ряд", address: "Манежная площадь, 1 стр 2" }
];

// Развернутые художественные описания на 7-10 предложений
const tripsData = {
    "Тула": "Тула — это один из старейших и красивейших городов России, славящийся своими уникальными ремесленными традициями. Здесь вы сможете посетить величественный Тульский кремль, который полностью сохранил свой первозданный исторический облик. В знаменитом Музее оружия вас ждет уникальная интерактивная экспозиция, рассказывающая о многовековой истории русского оружейного мастерства. Не забудьте заглянуть в уютный Музей тульского пряника, где можно не только узнать секреты его приготовления, но и попробовать свежайшую выпечку с ароматным чаем. Набережная реки Упы предлагает прекрасные зоны для неспешных пеших прогулок в любое время суток. Современное творческое пространство «Октава» порадует любителей искусства своими выставками, лекциями и стильными кафе. А всего в нескольких километрах от города находится Ясная Поляна — живописная усадьба, где жил и создавал свои шедевры великий писатель Лев Толстой. Это идеальное направление для насыщенных и запоминающихся выходных.",
    "Гжель": "Гжель — это удивительный и живописный подмосковный край, ставший всемирно известной колыбелью традиционной русской керамики. Сюда отправляются ради того, чтобы воочию увидеть процесс создания знаменитого бело-синего фарфора. Во время экскурсии на действующее производство вы познакомитесь с потомственными мастерами и узнаете все тонкости уникальной ручной росписи. В местном музее представлена богатейшая коллекция исторических изделий, завораживающих своей тонкой детализацией и изяществом. Каждый желающий может принять участие в увлекательном мастер-классе и расписать собственный сувенир на память. Помимо ремесленной эстетики, Гжель славится своей тихой, умиротворяющей загородной природой и старинными святыми источниками. Прогулки по местным улочкам с деревянной архитектурой позволяют полностью отвлечься от суеты мегаполиса. Здесь царит неповторимая атмосфера душевного тепла, уюта и искреннего гостеприимства. Это путешествие подарит вам массу ярких впечатлений, вдохновения и красивых памятных фотографий."
};

const foodCategories = {
    "Японская": ['Ramen', 'Якитория', 'СушиМастер', 'Чифанька'],
    "Кавказская": ['Про Кавказ', 'Джон Джоли', 'Старик Хинкалыч', 'The Хинкал'],
    "Американская": ['Вкусно и точка', 'Rostics'],
    "Рыбная": ['FishPoint', 'Моремания'],
    "Итальянская": ['Papa Johns', 'Додо', 'Pasta Qween'],
    "Русская": ['The Bык', 'NicePriceCoffee', 'Теремок']
};

const flowersData = [
    { id: 1, name: "Кустовая роза", shortDesc: "Изящное соцветие", longDesc: "Пышные кустовые розы, создающие ощущение праздничной лёгкости.", colors: [{hex: "#D32F2F", name: "Красный"}, {hex: "#FAFAFA", name: "Белый"}, {hex: "#F48FB1", name: "Нежно-розовый"}, {hex: "#FBC02D", name: "Желтый"}, {hex: "#FFAB91", name: "Персиковый"}] },
    { id: 2, name: "Гвоздика", shortDesc: "Классическая стойкость", longDesc: "Стойкие и изящные цветы с богатой палитрой оттенков.", colors: [{hex: "#C62828", name: "Красный"}, {hex: "#FAFAFA", name: "Белый"}, {hex: "#F06292", name: "Розовый"}, {hex: "#880E4F", name: "Бордовый"}, {hex: "#FFF176", name: "Светло-желтый"}] },
    { id: 3, name: "Альстромерия", shortDesc: "Перуанская лилия", longDesc: "Яркие и нежные лепестки, которые долго сохраняют свежесть.", colors: [{hex: "#FAFAFA", name: "Белый"}, {hex: "#EC407A", name: "Малиновый"}, {hex: "#FFEE58", name: "Желтый"}, {hex: "#FFA726", name: "Оранжевый"}, {hex: "#AB47BC", name: "Фиолетовый"}] },
    { id: 4, name: "Георгин", shortDesc: "Осеннее великолепие", longDesc: "Крупные, геометрически идеальные бутоны.", colors: [{hex: "#880E4F", name: "Темно-бордовый"}, {hex: "#D32F2F", name: "Красный"}, {hex: "#FF4081", name: "Ярко-розовый"}, {hex: "#FFEB3B", name: "Желтый"}, {hex: "#FAFAFA", name: "Белый"}] },
    { id: 5, name: "Гортензия", shortDesc: "Облако нежности", longDesc: "Объемное соцветие, напоминающее лёгкое воздушное облако.", colors: [{hex: "#64B5F6", name: "Небесно-голубой"}, {hex: "#F48FB1", name: "Розовый"}, {hex: "#FAFAFA", name: "Белый"}, {hex: "#CE93D8", name: "Сиреневый"}] },
    { id: 6, name: "Лилия", shortDesc: "Королевский шарм", longDesc: "Благородный цветок с утончённым силуэтом и глубоким ароматом.", colors: [{hex: "#FAFAFA", name: "Белый"}, {hex: "#F48FB1", name: "Розовый"}, {hex: "#FFF176", name: "Желтый"}, {hex: "#FFB74D", name: "Оранжевый"}, {hex: "#B71C1C", name: "Темно-красный"}] },
    { id: 7, name: "Мимоза", shortDesc: "Весеннее солнце", longDesc: "Яркие пушистые соцветия, дарящие весеннее тепло.", colors: [{hex: "#FFEA00", name: "Ярко-желтый"}, {hex: "#FFEE58", name: "Светло-желтый"}, {hex: "#FFC107", name: "Золотистый"}] },
    { id: 8, name: "Пионы", shortDesc: "Пышный шик", longDesc: "Невероятно востребованные и ароматные многослойные бутоны.", colors: [{hex: "#F8BBD0", name: "Нежно-розовый"}, {hex: "#FAFAFA", name: "Белый"}, {hex: "#D81B60", name: "Малиновый"}, {hex: "#FF8A65", name: "Коралловый"}, {hex: "#880E4F", name: "Винный"}] },
    { id: 9, name: "Подсолнух", shortDesc: "Энергия солнца", longDesc: "Яркий, жизнерадостный цветок, привносящий позитив.", colors: [{hex: "#FFEB3B", name: "Классический желтый"}, {hex: "#FFC107", name: "Оранжево-желтый"}, {hex: "#5D4037", name: "Коричнево-красный"}] },
    { id: 10, name: "Протея", shortDesc: "Экзотический центр", longDesc: "Уникальный доминантный цветок для ценителей высокой флористики.", colors: [{hex: "#F8BBD0", name: "Светло-розовый"}, {hex: "#F06292", name: "Насыщенно-розовый"}, {hex: "#880E4F", name: "Бордовый"}, {hex: "#FAFAFA", name: "Белый"}] },
    { id: 11, name: "Одноголовая роза", shortDesc: "Классический выбор", longDesc: "Идеальный крупный бутон на высоком элегантном стебле.", colors: [{hex: "#D32F2F", name: "Красный"}, {hex: "#FAFAFA", name: "Белый"}, {hex: "#F06292", name: "Розовый"}, {hex: "#880E4F", name: "Бордовый"}, {hex: "#FFCCBC", name: "Персиковый"}] },
    { id: 12, name: "Пионовидная роза", shortDesc: "Французский стиль", longDesc: "Изысканное сочетание классической розы и пышной текстуры пиона.", colors: [{hex: "#F8BBD0", name: "Пудрово-розовый"}, {hex: "#FFE0B2", name: "Кремово-персиковый"}, {hex: "#E91E63", name: "Малиновый"}, {hex: "#FAFAFA", name: "Белый"}, {hex: "#D32F2F", name: "Красный"}] },
    { id: 13, name: "Ромашка", shortDesc: "Полевая искренность", longDesc: "Милые садовые ромашки, создающие атмосферу тепла и уюта.", colors: [{hex: "#FAFAFA", name: "Белая"}, {hex: "#FFEB3B", name: "Желтая"}, {hex: "#F48FB1", name: "Светло-розовая"}] },
    { id: 14, name: "Сирень", shortDesc: "Весенний шлейф", longDesc: "Пышные ароматные веточки с незабываемым ностальгическим запахом.", colors: [{hex: "#E1BEE7", name: "Светло-сиреневый"}, {hex: "#AB47BC", name: "Насыщенный сиреневый"}, {hex: "#7B1FA2", name: "Пурпурный"}, {hex: "#FAFAFA", name: "Белый"}] },
    { id: 15, name: "Тюльпан", shortDesc: "Свежесть утра", longDesc: "Хрустящие сочные стебли и нежные классические бутоны.", colors: [{hex: "#D32F2F", name: "Красный"}, {hex: "#FFEB3B", name: "Желтый"}, {hex: "#FAFAFA", name: "Белый"}, {hex: "#F06292", name: "Розовый"}, {hex: "#8E24AA", name: "Фиолетовый"}, {hex: "#FF9800", name: "Оранжевый"}] },
    { id: 16, name: "Хризантема", shortDesc: "Абсолютная стойкость", longDesc: "Пышный цветок, способный оставаться свежим в вазе рекордное время.", colors: [{hex: "#FAFAFA", name: "Белый"}, {hex: "#FFEB3B", name: "Желтый"}, {hex: "#AED581", name: "Светло-зеленый"}, {hex: "#F06292", name: "Розовый"}, {hex: "#880E4F", name: "Бордовый"}, {hex: "#CE93D8", name: "Сиреневый"}] },
    { id: 17, name: "Экзотика", shortDesc: "Тропический микс", longDesc: "Редкие декоративные растения для самых необычных букетов." },
    { id: 18, name: "Букет", shortDesc: "Авторская сборка", longDesc: "Гармоничная композиция, собранная профессиональным флористом." }
];

// --- 2. ГЕНЕРАЦИЯ ИНТЕРФЕЙСА ПРИ ЗАГРУЗКЕ ---
window.addEventListener('DOMContentLoaded', () => {
    renderAllSections();
    buildInfiniteWheels();
    updateProfileUI(); 
    setupWheelDragAndType(wheelHours, inputHours, 24);
    setupWheelDragAndType(wheelMinutes, inputMinutes, 60);
});

function renderAllSections() {
    const walkContainer = document.getElementById('walk-container');
    walkContainer.innerHTML = walkPlaces.map(place => `
        <div class="list-item">
            <button class="name-btn">${place}</button>
            <button class="choose-btn" onclick="openStandardCalendar('${place}')">Выбрать</button>
        </div>`).join('');

    const mallsContainer = document.getElementById('malls-container');
    mallsContainer.innerHTML = mallsList.map(mall => `
        <div class="list-item">
            <button class="mall-name-btn">
                <span class="mall-title">${mall.name}</span>
                <span class="mall-address">${mall.address}</span>
            </button>
            <button class="choose-btn" onclick="openStandardCalendar('${mall.name}')">Выбрать</button>
        </div>`).join('');

    const tripsContainer = document.getElementById('trips-container');
    tripsContainer.innerHTML = Object.keys(tripsData).map(city => 
        `<button class="trip-main-btn" onclick="openTripModal('${city}')">${city}</button>`
    ).join('');
}

function openFoodCategory(category) {
    document.getElementById('food-category-title').innerText = category;
    const container = document.getElementById('food-list-container');
    container.innerHTML = foodCategories[category].map(restaurant => `
        <div class="list-item">
            <button class="name-btn">${restaurant}</button>
            <button class="choose-btn" onclick="openStandardCalendar('${restaurant}')">Выбрать</button>
        </div>`).join('');
    navigate('screen-food-list');
}

// --- 3. НАВИГАЦИЯ ---
function navigate(targetScreenId) {
    const currentScreen = document.querySelector('.screen:not(.hidden)');
    if (currentScreen) { historyStack.push(currentScreen.id); currentScreen.classList.add('hidden'); }
    document.getElementById(targetScreenId).classList.remove('hidden');
    updateBackButton(targetScreenId);
}

function goBack() {
    if (historyStack.length === 0) return;
    const currentScreen = document.querySelector('.screen:not(.hidden)');
    if (currentScreen) currentScreen.classList.add('hidden');
    const previousScreenId = historyStack.pop();
    document.getElementById(previousScreenId).classList.remove('hidden');
    updateBackButton(previousScreenId);
}

function updateBackButton(currentScreenId) {
    const btnBack = document.getElementById('btn-back');
    if (currentScreenId === 'screen-main' || currentScreenId === 'screen-finish') btnBack.classList.add('hidden');
    else btnBack.classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// --- 4. МОДАЛКИ И КАЛЕНДАРИ ---
function openStandardCalendar(itemName) {
    selectedContextItem = itemName; 
    openCalendar('edit');
}

// Динамическое заполнение обновленного окна поездки
function openTripModal(city) {
    selectedContextItem = city;
    document.getElementById('trip-title').innerText = city;
    document.getElementById('trip-desc').innerText = tripsData[city];
    document.getElementById('trip-modal-img').src = `images/${city === 'Тула' ? 19 : 20}.jpg`;
    document.getElementById('trip-info-modal').classList.remove('hidden');
}

/* Цветы */
let selectedFlowerColor = null; 
function openFlowersSection() {
    navigate('screen-flowers');
    const galleryContainer = document.getElementById('flowers-gallery');
    galleryContainer.innerHTML = flowersData.map(flower => `
        <div class="flower-card" onclick="openFlowerModal(${flower.id})">
            <img src="images/${flower.id}.jpg" alt="${flower.name}" class="flower-img">
            <div class="flower-overlay">
                <h3>${flower.name}</h3>
                <p>${flower.shortDesc}</p>
            </div>
        </div>
    `).join('');
}

function openFlowerModal(flowerId) {
    const flower = flowersData.find(f => f.id === flowerId);
    if (!flower) return;
    
    selectedFlowerColor = null; 
    selectedContextItem = flower.name;
    document.getElementById('flower-modal-img').src = `images/${flower.id}.jpg`;
    document.getElementById('flower-modal-title').innerText = flower.name;
    document.getElementById('flower-modal-desc').innerText = flower.longDesc;

    const colorsSection = document.getElementById('flower-colors-section');
    const paletteContainer = document.getElementById('flower-color-palette');
    
    if (flower.colors && flower.colors.length > 0) {
        colorsSection.classList.remove('hidden');
        paletteContainer.innerHTML = ''; 
        flower.colors.forEach((colorObj, index) => {
            const colorBox = document.createElement('div');
            colorBox.classList.add('color-box');
            colorBox.style.backgroundColor = colorObj.hex;
            colorBox.title = colorObj.name; 
            if (index === 0) { colorBox.classList.add('selected'); selectedFlowerColor = colorObj.name; }
            colorBox.onclick = function() {
                document.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
                this.classList.add('selected');
                selectedFlowerColor = colorObj.name; 
            };
            paletteContainer.appendChild(colorBox);
        });
    } else {
        colorsSection.classList.add('hidden');
        paletteContainer.innerHTML = '';
    }
    document.getElementById('flower-modal').classList.remove('hidden');
}

function chooseFlowerAndGoToDate() {
    if (selectedFlowerColor) selectedContextItem += ` (${selectedFlowerColor})`;
    closeModal('flower-modal');
    openCalendar('edit');
}

/* Многодневный календарь с ограничением до 7 дней */
let rangeStart = null;
let rangeEnd = null;

function openMultiCalendar() {
    closeModal('trip-info-modal');
    const grid = document.getElementById('multi-calendar-grid');
    grid.innerHTML = '';
    rangeStart = null; rangeEnd = null;

    for (let i = 1; i <= 30; i++) {
        const day = document.createElement('div');
        day.classList.add('day-cell');
        day.innerText = i;
        day.dataset.day = i;
        day.onclick = () => handleMultiDayClick(i);
        grid.appendChild(day);
    }
    document.getElementById('multi-calendar-modal').classList.remove('hidden');
}

function handleMultiDayClick(dayNum) {
    if (rangeStart && rangeEnd) { 
        rangeStart = dayNum; 
        rangeEnd = null; 
    } 
    else if (!rangeStart) { 
        rangeStart = dayNum; 
    } 
    else if (rangeStart && !rangeEnd) {
        if (dayNum >= rangeStart) {
            // Проверка лимита: разница дней включительно не более 7 дней
            if (dayNum - rangeStart + 1 > 7) {
                showToast("Период поездки не может превышать 7 дней!");
                return;
            }
            rangeEnd = dayNum;
        } else {
            if (rangeStart - dayNum + 1 > 7) {
                showToast("Период поездки не может превышать 7 дней!");
                return;
            }
            rangeEnd = rangeStart;
            rangeStart = dayNum; 
        }
    }
    updateMultiCalendarVisuals(false); 
}

function updateMultiCalendarVisuals(isConfirmed) {
    const cells = document.querySelectorAll('#multi-calendar-grid .day-cell');
    cells.forEach(cell => {
        const d = parseInt(cell.dataset.day);
        cell.classList.remove('in-range', 'confirmed');
        if (rangeStart && d === rangeStart) cell.classList.add(isConfirmed ? 'confirmed' : 'in-range');
        else if (rangeStart && rangeEnd && d >= rangeStart && d <= rangeEnd) cell.classList.add(isConfirmed ? 'confirmed' : 'in-range');
    });
}

function confirmMultiDateSelection() {
    if (!rangeStart) return showToast("Сначала выберите даты поездки!");
    if (!rangeEnd) rangeEnd = rangeStart; 
    updateMultiCalendarVisuals(true); 
    
    const user = getCurrentUser();
    if (user) {
        if (!user.savedDates) user.savedDates = {};
        const eventStr = `Поездка: ${selectedContextItem} (с ${rangeStart} по ${rangeEnd})`;
        user.savedDates[`trip-${Date.now()}`] = eventStr; 
        setCurrentUser(user);
        const db = getUsersDB(); const uIdx = db.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
        if (uIdx !== -1) { db[uIdx].savedDates = user.savedDates; saveUsersDB(db); }
        showToast(`Поездка сохранена! (с ${rangeStart} по ${rangeEnd} числа)`);
    } else {
        showToast(`Даты выбраны: с ${rangeStart} по ${rangeEnd}. Войдите, чтобы сохранить!`);
    }
    
    setTimeout(() => closeModal('multi-calendar-modal'), 1000);
}

// --- 5. АВТОРИЗАЦИЯ, ЛОКАЛЬНАЯ БД, ОБЫЧНЫЙ КАЛЕНДАРЬ ---
const authModal = document.getElementById('auth-modal');
const viewLogin = document.getElementById('auth-view-login');
const viewRegister = document.getElementById('auth-view-register');
const viewProfile = document.getElementById('auth-view-profile');
const profileLabel = document.getElementById('profile-label');
const profileGreeting = document.getElementById('profile-greeting');

function getUsersDB() { return JSON.parse(localStorage.getItem('users_db')) || []; }
function saveUsersDB(db) { localStorage.setItem('users_db', JSON.stringify(db)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('current_user')) || null; }
function setCurrentUser(user) { localStorage.setItem('current_user', JSON.stringify(user)); }

function openAuthModal() {
    authModal.classList.remove('hidden');
    const user = getCurrentUser();
    if (user) switchAuthView('profile'); else switchAuthView('login');
}
function closeAuthOverlay(event) { if (event.target === authModal) closeModal('auth-modal'); }

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
    if (user) { profileLabel.innerText = user.name; profileLabel.classList.remove('hidden'); } 
    else { profileLabel.classList.add('hidden'); }
}

function handleLoginSubmit() {
    const userInp = document.getElementById('login-username').value.trim();
    const passInp = document.getElementById('login-password').value;
    const db = getUsersDB();
    const foundUser = db.find(u => u.username.toLowerCase() === userInp.toLowerCase() && u.password === passInp);
    if (foundUser) {
        setCurrentUser(foundUser); updateProfileUI(); showToast(`Добро пожаловать, ${foundUser.name}!`);
        closeModal('auth-modal'); document.getElementById('login-username').value = ''; document.getElementById('login-password').value = '';
    } else {
        const activeBox = document.getElementById('auth-view-login');
        document.body.classList.add('error-bg'); activeBox.classList.add('shake-animation');
        setTimeout(() => { document.body.classList.remove('error-bg'); activeBox.classList.remove('shake-animation'); }, 1000);
    }
}

function handleRegisterSubmit() {
    const userInp = document.getElementById('reg-username').value.trim();
    const passInp = document.getElementById('reg-password').value;
    const nameInp = document.getElementById('reg-name').value.trim();
    if (!userInp || !passInp || !nameInp) return showToast("Заполните все поля!");
    const db = getUsersDB();
    if (db.some(u => u.username.toLowerCase() === userInp.toLowerCase())) return showToast("Логин уже занят.");
    const newUser = { username: userInp, password: passInp, name: nameInp, savedDates: {} };
    db.push(newUser); saveUsersDB(db); setCurrentUser(newUser); updateProfileUI();
    showToast("Регистрация успешна!"); closeModal('auth-modal');
    document.getElementById('reg-username').value = ''; document.getElementById('reg-password').value = ''; document.getElementById('reg-name').value = '';
}

function handleLogout() { localStorage.removeItem('current_user'); updateProfileUI(); showToast("Вы вышли из системы"); closeModal('auth-modal'); }

const calendarModal = document.getElementById('calendar-modal');
const calendarMonthYear = document.getElementById('calendar-month-year');
const calendarDaysContainer = document.getElementById('calendar-days');
const calendarViewModeEl = document.getElementById('calendar-view-mode');
const calendarEditModeEl = document.getElementById('calendar-edit-mode');
const eventDetailsText = document.getElementById('event-details-text');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDay = null; 
let currentCalendarMode = 'view'; 

const monthsRu = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
const monthsRuTitle = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function openCalendar(mode = 'view') {
    currentCalendarMode = mode;
    calendarModal.classList.remove('hidden');
    closeModal('auth-modal');
    if (mode === 'edit') {
        calendarEditModeEl.classList.remove('hidden'); calendarViewModeEl.classList.add('hidden');
        setTimeout(centerTimeWheels, 50);
    } else {
        calendarEditModeEl.classList.add('hidden'); calendarViewModeEl.classList.remove('hidden');
        eventDetailsText.innerHTML = "Выберите день, чтобы посмотреть планы.";
    }
    selectedDay = null; renderCalendar();
}

function closeCalendarOverlay(event) { if (event.target === calendarModal) closeModal('calendar-modal'); }

function renderCalendar() {
    calendarMonthYear.innerText = `${monthsRuTitle[currentMonth]} ${currentYear}`;
    calendarDaysContainer.innerHTML = '';
    let firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    let startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const user = getCurrentUser();

    for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div'); emptyCell.classList.add('empty'); calendarDaysContainer.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div'); dayCell.innerText = day;
        const dateKey = `${currentYear}-${currentMonth}-${day}`;
        if (user && user.savedDates && user.savedDates[dateKey]) dayCell.classList.add('saved-date');
        else if (day === selectedDay && currentCalendarMode === 'edit') dayCell.classList.add('selected-date');

        dayCell.onclick = () => {
            selectedDay = day; renderCalendar(); 
            if (currentCalendarMode === 'view') {
                if (user && user.savedDates && user.savedDates[dateKey]) {
                    eventDetailsText.innerHTML = `<strong>${day} ${monthsRu[currentMonth]}</strong>Событие: ${user.savedDates[dateKey]}`;
                } else {
                    eventDetailsText.innerHTML = `<strong>${day} ${monthsRu[currentMonth]}</strong>Свободный день! Планов нет.`;
                }
            }
        };
        calendarDaysContainer.appendChild(dayCell);
    }

    let totalCells = startDay + daysInMonth;
    for (let i = 0; i < (42 - totalCells); i++) {
        const emptyCell = document.createElement('div'); emptyCell.classList.add('empty'); calendarDaysContainer.appendChild(emptyCell);
    }
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; } else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    selectedDay = null; 
    if (currentCalendarMode === 'view') eventDetailsText.innerHTML = "Выберите день, чтобы посмотреть планы.";
    renderCalendar();
}

function resetDateSelection() {
    if (selectedDay === null) return showToast("Выберите конкретный день для очистки");
    const user = getCurrentUser(); const dateKey = `${currentYear}-${currentMonth}-${selectedDay}`;
    if (user && user.savedDates && user.savedDates[dateKey]) {
        delete user.savedDates[dateKey]; setCurrentUser(user);
        const db = getUsersDB(); const uIdx = db.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
        if (uIdx !== -1) { db[uIdx].savedDates = user.savedDates; saveUsersDB(db); }
        showToast("Событие удалено из календаря");
    } else { showToast("На этот день нет событий"); }
    selectedDay = null; renderCalendar(); closeModal('calendar-modal');
}

function saveDateSelection() {
    if (selectedDay === null) return showToast("Сначала выберите день!");
    const hEl = document.querySelector('#wheel-hours .active-time'); 
    const mEl = document.querySelector('#wheel-minutes .active-time');
    const timeStr = `${hEl ? hEl.innerText : "00"}:${mEl ? mEl.innerText : "00"}`;
    const user = getCurrentUser(); const dateKey = `${currentYear}-${currentMonth}-${selectedDay}`;

    const eventName = selectedContextItem ? `${selectedContextItem} в ${timeStr}` : `Событие в ${timeStr}`;

    if (user) {
        if (!user.savedDates) user.savedDates = {};
        user.savedDates[dateKey] = eventName; setCurrentUser(user);
        const db = getUsersDB(); const uIdx = db.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
        if (uIdx !== -1) { db[uIdx].savedDates = user.savedDates; saveUsersDB(db); }
        showToast(`Сохранено! (${selectedDay} ${monthsRu[currentMonth]} - ${eventName})`);
    } else { showToast(`Даты выбраны временно. Войдите в аккаунт!`); }
    
    selectedContextItem = ""; 
    selectedDay = null; renderCalendar(); closeModal('calendar-modal');
}

function showToast(message) {
    toast.innerText = message; toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 5000);
}

// --- 6. КОЛЕСИКИ ВРЕМЕНИ ---
const wheelHours = document.getElementById('wheel-hours');
const wheelMinutes = document.getElementById('wheel-minutes');
const inputHours = document.getElementById('input-hours');
const inputMinutes = document.getElementById('input-minutes');
let hoursResetTimeout = null; let minutesResetTimeout = null;

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
        const distance = Math.abs(wheelCenter - (item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2));
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