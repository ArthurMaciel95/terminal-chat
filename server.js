import { Server } from "socket.io";
import http from "http";

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Permite conexões de qualquer origem (pode restringir a um domínio específico)
    methods: ["GET", "POST"],
  },
});

let clients = {}; // Objeto para armazenar os clientes conectados

io.on("connection", (socket) => {
  clients[socket.id] = socket; // Armazena o cliente pelo ID

  console.log(`Novo cliente conectado: ${socket.id}`);

  // Emite a lista de usuários online quando alguém se conecta
  io.emit("update_users", Object.keys(clients)); // Atualiza todos os clientes conectados com a nova lista de usuários

  socket.on("new_user", () => {
    // Emite para todos os clientes, incluindo o novo
    io.emit("message", {
      id: "Servidor",
      message: `${socket.id} entrou na sala`,
    });
  });

  // Escuta mensagens de chat
  socket.on("message", (msg) => {
    if (msg.startsWith("/")) {
      if (msg === "/list") {
        // Se a mensagem for um comando /list, envia a lista de clientes
        const clientList = Object.keys(clients).join(", ");
        socket.emit("message", {
          id: "Servidor",
          message: `${clientList}`,
        });
      } else {
        // Comando não encontrado
        socket.emit("message", {
          id: "Servidor",
          message: "Comando não encontrado",
        });
      }
    } else {
      // Agora todos, incluindo o remetente, receberão a mensagem
      io.emit("message", { id: socket.id, message: msg });
    }
  });

  socket.on("audioMessage", (audioData) => {
    socket.broadcast.emit("audioMessage", audioData);
  });

  // Enviar a mensagem de imagem para todos os outros usuários conectados
  socket.on("imageMessage", (data) => {
    // Envia a imagem com o remetente
    io.emit("imageMessage", {
      imageData: data.imageData, // Dados da imagem
      sender: data.sender, // Remetente
    });
  });

  // Evento para mostrar quem está digitando
  socket.on("typing", (userId) => {
    socket.broadcast.emit("showTyping", userId);
  });

  // Evento para remover a indicação de digitação
  socket.on("stopTyping", (userId) => {
    socket.broadcast.emit("hideTyping", userId);
  });

  // Quando o servidor solicitar o vídeo de um usuário
  socket.on("request_video_stream", (userId) => {
    if (clients[userId]) {
      // Envia o stream de vídeo do usuário para o solicitante
      clients[userId].emit("send_video_stream", socket.id, socket.stream);
    }
  });

  // Quando um usuário enviar seu stream de vídeo
  socket.on("send_video_stream", (stream) => {
    socket.stream = stream; // Armazena o stream recebido para esse usuário
  });

  // Quando um cliente se desconecta
  socket.on("disconnect", () => {
    delete clients[socket.id];
    console.log(`Cliente desconectado: ${socket.id}`);
    io.emit("update_users", Object.keys(clients)); // Atualiza todos os clientes com a nova lista de usuários
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
