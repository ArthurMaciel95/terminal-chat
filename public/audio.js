const messageSound = new Audio("./audio/noti.mp3");
const recordBtn = document.getElementById("recordBtn");
const sendAudioBtn = document.getElementById("sendAudioBtn");
let mediaRecorder;
let audioChunks = [];
let recordingTimeout;
// Permissão para gravar áudio
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    sendAudioBtn.classList.remove("hidden");
    recordBtn.textContent = "🎤 Gravar Áudio";
  };
});

// Iniciar gravação
recordBtn.addEventListener("click", () => {
  if (mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  } else {
    audioChunks = [];
    mediaRecorder.start();
    recordBtn.textContent = "🔴 Gravando (5s máx)...";
    sendAudioBtn.classList.add("hidden");

    recordingTimeout = setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }, 5000);
  }
});

// Enviar áudio para o servidor
sendAudioBtn.addEventListener("click", () => {
  const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
  const reader = new FileReader();
  reader.readAsDataURL(audioBlob);
  reader.onloadend = () => {
    const audioData = reader.result;
    socket.emit("audioMessage", audioData);
    addAudioMessage(audioData, clientId);
  };
  sendAudioBtn.classList.add("hidden");
});

// Adicionar mensagem de áudio no chat
function addAudioMessage(audioSrc, sender) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "p-2",
    "border",
    "border-gray-700",
    "rounded-lg",
    "mb-2"
  );

  const audioContainer = document.createElement("div");
  audioContainer.classList.add("waveform-container");
  messagesDiv.appendChild(messageElement);
  messageElement.innerHTML = `
        <strong class="text-blue-400">${sender}:</strong>
    `;

  messageElement.appendChild(audioContainer);

  // Cria o WaveSurfer
  const waveSurfer = WaveSurfer.create({
    width: "100%", // Largura do WaveSurfer
    height: 50, // Altura do WaveSurfer
    container: audioContainer,
    waveColor: "rgb(99 102 241)", // cor da onda
    progressColor: "rgb(37 99 235)", // cor do progresso
    barWidth: 3, // largura da barra da onda
    barHeight: 1, // altura das barras
    cursorColor: "rgba(255, 255, 255, 0.5)",
    responsive: true,
  });

  // Usando a URL base64 (reader.result) diretamente
  waveSurfer.load(audioSrc); // Carrega o áudio no WaveSurfer

  // Adicionar controle de play
  const playButton = document.createElement("button");
  playButton.textContent = "▶️ Reproduzir";
  playButton.classList.add(
    "mt-2",
    "px-4",
    "py-2",
    "bg-blue-600",
    "rounded-lg",
    "hover:bg-blue-700"
  );
  messageElement.appendChild(playButton);

  // Evento para controlar a reprodução
  playButton.addEventListener("click", () => {
    if (waveSurfer.isPlaying()) {
      waveSurfer.pause();
      playButton.textContent = "▶️ Reproduzir";
    } else {
      waveSurfer.play();
      playButton.textContent = "⏸️ Pausar";
    }
  });

  // adicionar um evento quando acabar a reprodução do audio ir para o inicio e mudar o texto do botão
  waveSurfer.on("finish", () => {
    playButton.textContent = "▶️ Reproduzir";
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Receber áudio de outros usuários
socket.on("audioMessage", (audioData) => {
  addAudioMessage(audioData, "Outro usuário");
});
