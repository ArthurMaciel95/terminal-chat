// Variáveis globais
let localStream;
let peerConnection;
const serverConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }; // Configuração STUN
const webcamElement = document.getElementById("webcam"); // Certifique-se de que o ID do elemento de vídeo está correto

callingSound.loop = true; // Define para tocar em loop

function startRinging() {
  callingSound
    .play()
    .catch((error) => console.error("Erro ao reproduzir som:", error));
}

function stopRinging() {
  callingSound.pause();
  callingSound.currentTime = 0; // Reinicia o som para o começo
}

// Função para acessar a webcam do usuário
async function startWebcam() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!localStream) {
      console.error("Erro ao capturar a webcam.");
      return;
    }

    const videoElement = document.createElement("video");
    videoElement.srcObject = localStream;
    videoElement.autoplay = true;
    videoElement.muted = true;
    document.getElementById("webcamsContainer").appendChild(videoElement);

    console.log("Webcam iniciada com sucesso!");
  } catch (error) {
    console.error("Erro ao acessar a câmera:", error);
  }
}

async function startCall(toUserId) {
  if (!localStream) {
    console.warn("Erro: localStream não está inicializado. Iniciando agora...");

    await startWebcam();
  }

  peerConnection = new RTCPeerConnection(serverConfig);

  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  peerConnection.onicecandidate = (event) => {
    if (event.candidate)
      socket.emit("ice-candidate", event.candidate, toUserId);
  };

  peerConnection.ontrack = (event) => showRemoteVideo(event.streams[0]);

  peerConnection
    .createOffer()
    .then((offer) => {
      return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
      socket.emit("offer", peerConnection.localDescription, toUserId);
    })
    .catch((err) => console.error("Erro ao criar oferta:", err));
}

function showRemoteVideo(stream) {
  const remoteVideo = document.createElement("video");
  remoteVideo.srcObject = stream;
  remoteVideo.autoplay = true;
  remoteWebcam.appendChild(remoteVideo);
}

// Exibir popup de chamada recebida
socket.on("offer", (offer, fromUserId) =>
  showIncomingCallPopup(fromUserId, offer)
);

function showRequestCallPopup() {
  const callPopup = document.createElement("div");
  callPopup.id = "callPopup";
  callPopup.classList.add(
    "fixed",
    "top-0",
    "left-0",
    "w-full",
    "h-full",
    "flex",
    "items-center",
    "justify-center",
    "bg-gray-900",
    "bg-opacity-75"
  );
  callPopup.innerHTML = `
  <div class="bg-gray-700 p-5 rounded-lg shadow-lg text-center">
      <div class="flex items-center justify-center bg-gray-700 rounded-lg mb-4">
          <img src="./img/bob-esponja-dancando.gif" class="w-24 h-24 rounded-lg" alt="Avatar">
      </div>
      <p class="text-lg font-bold text-white">Aguardando Chamada de vídeo</p>
      <div class="mt-4 flex justify-center space-x-4">
       
          <button id="cancelCall" onclick="" class="bg-red-500 text-white px-4 py-2 rounded">Cancelar</button>
      </div>
  </div>
`;
  document.body.appendChild(callPopup);

  document.getElementById("cancelCall").addEventListener("click", () => {
    document.body.removeChild(callPopup);
    c;
    stopWebcam(); // Chama a função para parar a webcam
  });
}

function removeRequestCallPopup() {
  document.body.removeChild(callPopup);
}

function showIncomingCallPopup(fromUserId, offer) {
  const callPopup = document.createElement("div");
  startRinging();
  callPopup.id = "callPopup";
  callPopup.classList.add(
    "fixed",
    "top-0",
    "left-0",
    "w-full",
    "h-full",
    "flex",
    "items-center",
    "justify-center",
    "bg-gray-900",
    "bg-opacity-75"
  );
  callPopup.innerHTML = `
  <div class="bg-gray-700 p-5 rounded-lg shadow-lg text-center">
      <div class="flex items-center justify-center bg-gray-700 rounded-lg mb-4">
          <img src="./img/bob-esponja-dancando.gif" class="w-24 h-24 rounded-lg" alt="Avatar">
      </div>
      <p class="text-lg font-bold text-white">${fromUserId} está te ligando...</p>
      <div class="mt-4 flex justify-center space-x-4">
          <button id="acceptCall" onclick="" class="bg-green-500 text-white px-4 py-2 rounded">Aceitar</button>
          <button id="rejectCall" onclick="" class="bg-red-500 text-white px-4 py-2 rounded">Rejeitar</button>
      </div>
  </div>
`;

  document.body.appendChild(callPopup);
  // Lógica para aceitar a chamada
  document.getElementById("acceptCall").addEventListener("click", async () => {
    await startCall(); // Função para iniciar a webcam
    stopRinging();
    acceptCall(offer, fromUserId); // Função para aceitar a chamada
    document.body.removeChild(callPopup); // Remove o popup
  });
  document.getElementById("rejectCall").addEventListener("click", () => {
    document.body.removeChild(callPopup);
    stopRinging();

    rejectcall(fromUserId); // Passe fromUserId para rejectcall
  });
}

socket.on("update_users", (userList) => {
  let userColor;
  const usersUl = document.getElementById("users");
  usersUl.innerHTML = ""; // Limpa a lista antes de atualizar

  userList.forEach((userId) => {
    userColor = generateColorFromId(userId); // Obtém a cor do usuário

    const li = document.createElement("li");
    li.textContent = userId;
    li.style.color = userColor;

    // Verifica se o ID não é o do próprio usuário antes de adicionar o ícone
    if (userId !== socket.id) {
      // Cria um ícone de câmera
      const cameraIcon = document.createElement("span");
      cameraIcon.innerHTML = "🎥"; // Ícone de câmera (pode ser substituído por Font Awesome ou outra biblioteca)
      cameraIcon.style.cursor = "pointer"; // Deixa o ícone clicável
      cameraIcon.style.marginLeft = "10px"; // Espaçamento para o ícone

      // Adiciona o ícone de câmera ao item de lista
      li.appendChild(cameraIcon);
      // Adiciona o ouvinte de evento de clique no ícone de câmera
      cameraIcon.addEventListener("click", () => {
        startCall(userId); // Inicia a chamada para o usuário que foi clicado
        showRequestCallPopup();
      });
    }

    usersUl.appendChild(li);
  });
});

function stopWebcam() {
  // Parar todas as tracks de mídia
  console.log("Parando a webcam...");
  console.log(localStream);
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop(); // Para cada track de áudio e vídeo
    });
    localStream = null; // Libera o objeto localStream
  }

  // const videoElement = document.createElement("video");
  // videoElement.srcObject = localStream;
  // videoElement.autoplay = true;
  // videoElement.muted = true;
  // document.getElementById("webcamsContainer").appendChild(videoElement);

  videoElement.srcObject = null; // Limpa o objeto de vídeo
  videoElement.remove(); // Remove o elemento de vídeo
  console.log("Webcam parada com sucesso!");
  document.getElementById("webcamsContainer").innerHTML = ""; // Limpa o contêiner de vídeo
}

socket.on("call_rejected", (callerId) => {
  removeRequestCallPopup();
  // Aqui você pode adicionar mais lógica para tratar a rejeição da chamada.

  messages.innerHTML = `<p class="text-red-500">Chamada rejeitada por ${callerId}</p>`;
});

async function acceptCall(offer, fromUserId) {
  peerConnection = new RTCPeerConnection(serverConfig);
  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", peerConnection.localDescription, fromUserId);
  peerConnection.onicecandidate = (event) => {
    if (event.candidate)
      socket.emit("ice-candidate", event.candidate, fromUserId);
  };
  peerConnection.ontrack = (event) => showRemoteVideo(event.streams[0]);
}

async function rejectcall(fromUserId) {
  socket.emit("call_rejected", fromUserId);
  stopWebcam(); // Chama a função para parar a webcam
}

// Evento para receber a resposta de um usuário (enviada pelo servidor)
socket.on("answer", (answer, fromUserId) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Evento para receber os candidatos ICE de outro usuário
socket.on("ice-candidate", (candidate, fromUserId) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});
