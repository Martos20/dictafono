window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const stopBtn = document.getElementById('stop-btn');
const transcriptionEl = document.getElementById('transcription');
const statusEl = document.getElementById('status');
const historyEl = document.getElementById('history');
const downloadBtn = document.getElementById('download-btn');
const languageSelect = document.getElementById('language-select');
const recordingIndicator = document.getElementById('recording-indicator');
const notification = document.getElementById('notification');

let recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.maxAlternatives = 1;
let isPaused = false;
let fullTranscript = '';
let historyEntries = [];

// Función para actualizar el estado
function updateStatus(message) {
    statusEl.textContent = `Estado: ${message}`;
}

// Función para mostrar notificaciones
function showNotification(message) {
    notification.textContent = message;
    notification.style.opacity = 1;
    setTimeout(() => {
        notification.style.opacity = 0;
    }, 3000);
}

// Iniciar la grabación
startBtn.addEventListener('click', () => {
    recognition.lang = languageSelect.value;
    recognition.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    pauseBtn.disabled = false;
    recordingIndicator.style.visibility = 'visible';
    showNotification("Grabación iniciada");
    updateStatus("Grabando...");
});

// Pausar la grabación
pauseBtn.addEventListener('click', () => {
    recognition.stop();
    isPaused = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
    recordingIndicator.style.visibility = 'hidden';
    showNotification("Grabación pausada");
    updateStatus("Pausado");
});

// Reanudar la grabación
resumeBtn.addEventListener('click', () => {
    recognition.start();
    isPaused = false;
    resumeBtn.disabled = true;
    pauseBtn.disabled = false;
    recordingIndicator.style.visibility = 'visible';
    showNotification("Grabación reanudada");
    updateStatus("Grabando...");
});

// Detener la grabación
stopBtn.addEventListener('click', () => {
    recognition.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    recordingIndicator.style.visibility = 'hidden';
    showNotification("Grabación detenida");
    updateStatus("Inactivo");
    saveToHistory();  // Guardar la transcripción actual al historial
});

// Evento de resultado de reconocimiento
recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    fullTranscript += ` ${transcript}`;
    transcriptionEl.textContent = fullTranscript;
    transcriptionEl.classList.add('transcription-highlight');
    setTimeout(() => transcriptionEl.classList.remove('transcription-highlight'), 2000);
});

// Manejar el fin del reconocimiento
recognition.addEventListener('end', () => {
    if (!isPaused) {
        recognition.stop();
    }
});

// Guardar transcripción al historial
function saveToHistory() {
    if (fullTranscript.trim() !== '') {
        const listItem = document.createElement('li');
        listItem.textContent = fullTranscript;
        listItem.classList.add('history-item');
        historyEl.appendChild(listItem);
        historyEntries.push(fullTranscript);
        fullTranscript = '';
        transcriptionEl.textContent = 'La transcripción aparecerá aquí...';
        downloadBtn.disabled = false;  // Habilitar el botón de descarga si hay historial
    }
}

// Descargar la transcripción
downloadBtn.addEventListener('click', () => {
    const blob = new Blob([historyEntries.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcripcion.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Transcripción descargada");
});

// Actualizar el progreso de la barra de grabación
recognition.onspeechstart = () => {
    updateStatus("Grabando...");
    progressBar.value = 0;
    const interval = setInterval(() => {
        progressBar.value += 1;
        if (progressBar.value >= 100) {
            clearInterval(interval);
        }
    }, 100);
};

recognition.onspeechend = () => {
    updateStatus("Silencio detectado");
    progressBar.value = 0;
};
