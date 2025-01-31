// Elementos do DOM
const sendImageBtn = document.getElementById("sendImageBtn");
const imageInput = document.getElementById("imageInput");

// Enviar a imagem ou GIF para o servidor
sendImageBtn.addEventListener("click", () => {
  imageInput.click(); // Abre o seletor de arquivos
});

// Tamanho máximo permitido (300 KB)
const MAX_FILE_SIZE = 300 * 1024; // 300 KB em bytes

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    // Verificar o tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      alert("O arquivo é muito grande. O tamanho máximo permitido é 300 KB.");
      return; // Impede o envio do arquivo
    }

    const reader = new FileReader();
    reader.readAsDataURL(file); // Converte o arquivo para base64

    reader.onloadend = () => {
      const imageData = reader.result; // Dados da imagem ou GIF em base64

      // Emitir a imagem junto com o remetente
      socket.emit("imageMessage", {
        imageData: imageData,
        sender: clientId, // Usando o ID do cliente como remetente
      });

      //addImageMessage(imageData, clientId); // Exibe a imagem no chat
    };
  }
});
// Para receber a imagem do servidor
socket.on("imageMessage", (data) => {
  addImageMessage(data.imageData, data.sender); // Exibe a imagem no chat junto com o remetente
});

// Função para adicionar a imagem no chat
function addImageMessage(imageSrc, sender) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("mb-2");

  messageElement.innerHTML = `
<strong class="text-blue-400 mb-2">${sender}:</strong>
`;

  const imageElement = document.createElement("img");
  imageElement.src = imageSrc; // Usando a URL base64
  imageElement.classList.add("max-w-full", "rounded-lg", "w-1/2", "my-2");

  messageElement.appendChild(imageElement);
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Seletores do DOM
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const emojiContainer = document.getElementById("emojiContainer");
const messageInput = document.getElementById("messageInput");

// Inicializar o seletor de emojis
const picker = new EmojiMart.Picker({
  onSelect: (emoji) => {
    // Inserir o emoji na caixa de entrada de mensagem
    messageInput.value += emoji.native;
    emojiPicker.classList.add("hidden"); // Fechar o seletor após selecionar o emoji
  },
});
