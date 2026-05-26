// Находим кнопку "Назад"
const btnBack = document.getElementById('btn-back');

// Создаем "историю", чтобы знать, куда возвращаться
let historyStack = [];

// Функция для перехода вперед
function navigate(targetScreenId) {
    // Находим текущий активный экран (тот, у которого нет класса hidden)
    const currentScreen = document.querySelector('.screen:not(.hidden)');
    
    if (currentScreen) {
        // Записываем текущий экран в историю и прячем его
        historyStack.push(currentScreen.id);
        currentScreen.classList.add('hidden');
    }

    // Находим новый экран по ID и показываем его
    const targetScreen = document.getElementById(targetScreenId);
    targetScreen.classList.remove('hidden');

    // Проверяем, нужно ли показать кнопку "Назад"
    updateBackButton(targetScreenId);
}

// Функция для возврата назад
function goBack() {
    if (historyStack.length === 0) return; // Если истории нет, ничего не делаем

    // Прячем текущий экран
    const currentScreen = document.querySelector('.screen:not(.hidden)');
    if (currentScreen) {
        currentScreen.classList.add('hidden');
    }

    // Достаем из истории предыдущий экран и показываем его
    const previousScreenId = historyStack.pop();
    const previousScreen = document.getElementById(previousScreenId);
    previousScreen.classList.remove('hidden');

    // Проверяем, нужно ли показать кнопку "Назад"
    updateBackButton(previousScreenId);
}

// Функция управления видимостью кнопки "Назад"
function updateBackButton(currentScreenId) {
    // Прячем кнопку, если мы на старте или на финише
    if (currentScreenId === 'screen-main' || currentScreenId === 'screen-finish') {
        btnBack.classList.add('hidden');
    } else {
        // Во всех остальных случаях - показываем
        btnBack.classList.remove('hidden');
    }
}