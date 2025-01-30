import chalk from "chalk"; // Usando import
import readline from "readline";
import io from "socket.io-client";
const socket = io("https://terminal-chat-production-16e8.up.railway.app/");

let clientId = "";
let userColor = chalk.white; // Cor padrão para o usuário
socket.on("connect", () => {
  clientId = socket.id; // Armazena o ID do cliente
  userColor = generateColor(clientId); // Gera uma cor única para o usuário
  console.log(`Conectado ao servidor como ${userColor(clientId)}`);
  showPrompt();

  // Emite o evento 'new_user' para informar o servidor que este usuário entrou
  socket.emit("new_user");
});

// Função para gerar uma cor única com base no ID
function generateColor(id) {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0); // Cria um hash simples com base no ID
  const color = ["red", "green", "yellow", "blue", "magenta", "cyan", "white"][
    hash % 7
  ]; // Seleciona uma cor
  return chalk[color];
}

// Configura o readline para mostrar o ID como prefixo
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${userColor(clientId)}: `, // Define o ID como prefixo
});

// Exibe o prompt personalizado
function showPrompt() {
  rl.setPrompt(`${userColor(clientId)}: `);
  rl.prompt();
}

// Lê entrada do terminal e envia ao servidor
rl.on("line", (input) => {
  if (input.trim() !== "") {
    socket.emit("message", input); // Envia só a mensagem ao servidor
  }
  showPrompt(); // Mostra o prompt novamente após enviar
});

socket.on("imageMessage", (imageData) => {
  addImageMessage(imageData); // Exibe a imagem no chat
});

// Escuta mensagens de outros clientes
socket.on("message", (data) => {
  // Limpa a linha anterior e reposiciona o cursor
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);

  const senderColor = generateColor(data.id);

  // Exibe a mensagem recebida
  console.log(`${senderColor(data.id)}: ${data.message}`);

  // Atualiza o prompt depois de exibir a mensagem
  showPrompt();
});
