// Inserir o seletor de emojis no container
emojiContainer.appendChild(picker);

// Mostrar/Esconder o seletor de emojis
emojiBtn.addEventListener("click", () => {
  emojiPicker.classList.toggle("hidden");
});

// Fechar o seletor de emojis se clicar fora dele
document.addEventListener("click", (event) => {
  if (!emojiPicker.contains(event.target) && !emojiBtn.contains(event.target)) {
    emojiPicker.classList.add("hidden");
  }
});
