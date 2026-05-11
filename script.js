let workTime = 25;
let breakTime = 5;
let timeLeft = workTime * 60;
let timerId = null;
let isActive = false;
let isWork = true;

let totalPomodoros = 0;
let totalMinutesWorked = 0;

let sessionHistory = [];

const timerDisplay = document.getElementById('timerDisplay');
const modeText = document.getElementById('modeText');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const pomodoroCountSpan = document.getElementById('pomodoroCount');
const totalWorkTimeSpan = document.getElementById('totalWorkTime');
const historyList = document.getElementById('historyList');

const formatTime = (seconds) => {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    
    if (mins < 10) mins = '0' + mins;
    if (secs < 10) secs = '0' + secs;
    
    return mins + ':' + secs;
};

const updateUI = () => {
    timerDisplay.textContent = formatTime(timeLeft);
    
    if (isWork) {
        timerDisplay.className = 'workMode';
        modeText.innerHTML = 'Режим: РАБОТА';
    } else {
        timerDisplay.className = 'breakMode';
        modeText.innerHTML = 'Режим: ОТДЫХ';
    }
};

const playBeepSound = () => {
    let context = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = context.createOscillator();
    let gain = context.createGain();
    
    oscillator.connect(gain);
    gain.connect(context.destination);
    
    oscillator.frequency.value = 800;
    gain.gain.value = 0.3;
    
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.8);
    oscillator.stop(context.currentTime + 0.8);
    
    context.resume();
};

const showMessage = (msg) => {
    let popup = document.createElement('div');
    popup.textContent = msg;
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = '#333';
    popup.style.color = 'white';
    popup.style.padding = '12px 24px';
    popup.style.borderRadius = '30px';
    popup.style.zIndex = '999';
    popup.style.fontSize = '16px';
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 2500);
};

const addToHistory = () => {
    let today = new Date();
    let dateStr = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear();
    
    let historyItem = {
        date: dateStr,
        count: totalPomodoros
    };
    
    sessionHistory.unshift(historyItem);
    
    if (sessionHistory.length > 10) {
        sessionHistory.pop();
    }
    
    localStorage.setItem('pomodoroHistory', JSON.stringify(sessionHistory));
    
    historyList.innerHTML = '';
    for (let i = 0; i < sessionHistory.length; i++) {
        let li = document.createElement('li');
        li.textContent = sessionHistory[i].date + ' — ' + sessionHistory[i].count + ' помидоров';
        historyList.appendChild(li);
    }
};

const updateStats = () => {
    pomodoroCountSpan.textContent = totalPomodoros;
    totalWorkTimeSpan.textContent = totalMinutesWorked;
    
    localStorage.setItem('totalPomodoros', totalPomodoros);
    localStorage.setItem('totalMinutesWorked', totalMinutesWorked);
};

const switchMode = () => {
    if (isWork) {
        totalPomodoros++;
        totalMinutesWorked += workTime;
        updateStats();
        addToHistory();
        
        isWork = false;
        timeLeft = breakTime * 60;
        showMessage('Работа завершена! Отдых ' + breakTime + ' минут');
        playBeepSound();
    } else {
        isWork = true;
        timeLeft = workTime * 60;
        showMessage('Отдых закончен! Начинай работать');
        playBeepSound();
    }
    
    updateUI();
};

const tick = () => {
    if (timeLeft <= 0) {
        switchMode();
    } else {
        timeLeft--;
        updateUI();
    }
};

const startTimer = () => {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
    timerId = setInterval(tick, 1000);
    isActive = true;
    startPauseBtn.textContent = 'Пауза';
};

const pauseTimer = () => {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
    isActive = false;
    startPauseBtn.textContent = 'Старт';
};

const resetTimer = () => {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
    isActive = false;
    isWork = true;
    timeLeft = workTime * 60;
    startPauseBtn.textContent = 'Старт';
    updateUI();
};

const onStartPause = () => {
    if (isActive) {
        pauseTimer();
    } else {
        startTimer();
    }
};

const loadSavedData = () => {
    let savedPomodoros = localStorage.getItem('totalPomodoros');
    let savedMinutes = localStorage.getItem('totalMinutesWorked');
    let savedHistory = localStorage.getItem('pomodoroHistory');
    
    if (savedPomodoros !== null) {
        totalPomodoros = parseInt(savedPomodoros);
    }
    if (savedMinutes !== null) {
        totalMinutesWorked = parseInt(savedMinutes);
    }
    if (savedHistory !== null) {
        sessionHistory = JSON.parse(savedHistory);
    }
    
    updateStats();
    
    historyList.innerHTML = '';
    for (let i = 0; i < sessionHistory.length; i++) {
        let li = document.createElement('li');
        li.textContent = sessionHistory[i].date + ' — ' + sessionHistory[i].count + ' помидоров';
        historyList.appendChild(li);
    }
};

startPauseBtn.addEventListener('click', onStartPause);
resetBtn.addEventListener('click', resetTimer);

loadSavedData();
updateUI();