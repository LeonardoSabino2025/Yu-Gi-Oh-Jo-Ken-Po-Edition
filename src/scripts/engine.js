// Objeto de estado global para gerenciar elementos e dados do jogo
const state = {
  score: {
    playerScore: 0,
    computerScore: 0,
    scoreBox: document.getElementById("score_points"),
  },
  cardSprites: {
    avatar: document.getElementById("card-image"),
    name: document.getElementById("card-name"),
    type: document.getElementById("card-type"),
  },
  fieldCard: {
    player: document.getElementById("player-field-card"),
    computer: document.getElementById("computer-field-card"),
  },
  playerSides: { // Usado para referenciar os IDs dos containers das cartas
    player1: "player-cards",
    player1Box: document.querySelector("#player-cards"), // Referência direta ao elemento
    computer: "computer-cards",
    computerBox: document.querySelector("#computer-cards"), // Referência direta ao elemento
  },
  actions: {
    button: document.getElementById("next-duel"),
  },
    audios: {
    backgroundMusic: document.getElementById("background-music"),
  },
};

// Dados das cartas com suas propriedades e regras de Jo-Ken-Po
const cardData = [
  {
    id: 0,
    name: "Blue Eyes White Dragon",
    type: "Paper",
    img: "/src/assets/icons/dragon.png",
    WinOf: [1], // Ganha de Dark Magician (Rock)
    LoseOf: [2], // Perde para Exodia (Scissor)
  },
  {
    id: 1,
    name: "Dark Magician",
    type: "Rock",
    img: "/src/assets/icons/magician.png",
    WinOf: [2], // Ganha de Exodia (Scissor)
    LoseOf: [0], // Perde para Blue Eyes White Dragon (Paper)
  },
  {
    id: 2,
    name: "Exodia",
    type: "Scissor",
    img: "/src/assets/icons/exodia.png",
    WinOf: [0], // Ganha de Blue Eyes White Dragon (Paper)
    LoseOf: [1], // Perde para Dark Magician (Rock)
  },
];

// --- Funções Principais do Jogo ---

// Retorna um ID de carta aleatório baseado nos dados disponíveis
function getRandomCardID() {
  const randomIndex = Math.floor(Math.random() * cardData.length);
  return cardData[randomIndex].id;
}

// Cria e configura um elemento de imagem de carta
async function createCardImage(idCard, fieldSide) {
  const cardImage = document.createElement("img");
  cardImage.setAttribute("height", "100px");
  cardImage.setAttribute("src", "/src/assets/icons/card-back.png"); // Imagem do verso da carta
  cardImage.setAttribute("data-id", idCard); // Armazena o ID da carta nos dados do elemento
  cardImage.classList.add("card"); // Adiciona classe CSS para estilos

  // Adiciona listeners de evento apenas para cartas do jogador
  if (fieldSide === state.playerSides.player1) {
    cardImage.addEventListener("click", () => {
      setCardsField(cardImage.getAttribute("data-id"));
    });
    cardImage.addEventListener("mouseover", () => {
      drawSelectCard(idCard);
    });
  }
  return cardImage;
}

// Lógica principal do duelo após o jogador escolher uma carta
async function setCardsField(cardId) {
  await removeAllCardImages(); // Remove todas as cartas das mãos
  hideCardDetails(); // Esconde os detalhes da carta selecionada

  const computerCardId = getRandomCardID(); // Obtém uma carta aleatória para o computador

  // Exibe as cartas no campo de batalha
  state.fieldCard.player.style.display = "block";
  state.fieldCard.computer.style.display = "block";

  // Define as imagens das cartas no campo de batalha
  state.fieldCard.player.src = cardData[cardId].img;
  state.fieldCard.computer.src = cardData[computerCardId].img;

  const duelResults = await checkDuelResults(Number(cardId), computerCardId); // Converte cardId para número
  await updateScore(); // Atualiza o placar
  await drawButton(duelResults); // Exibe o botão com o resultado do duelo
}

// Atualiza o texto do placar
function updateScore() {
  state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

// Checa o resultado do duelo com base nas cartas escolhidas
async function checkDuelResults(playerCardID, computerCardId) {
  let duelResults = "EMPATE"; // Valor padrão

  const playerCard = cardData[playerCardID];
  // const computerCard = cardData[computerCardId]; // Não é diretamente usado, mas pode ser útil para debug

  if (playerCard.WinOf.includes(computerCardId)) {
    duelResults = "GANHOU!";
    await playAudio("win");
    state.score.playerScore++;
  } else if (playerCard.LoseOf.includes(computerCardId)) {
    duelResults = "PERDEU";
    await playAudio("lose");
    state.score.computerScore++;
  } else {
    // Caso de empate
    await playAudio("draw"); // Assumindo que você tenha um draw.wav
  }

  return duelResults;
}

// Remove todas as imagens de cartas das caixas de mão
async function removeAllCardImages() {
  let player1Cards = state.playerSides.player1Box;
  let computerCards = state.playerSides.computerBox;

  // Remove as imagens das cartas do jogador
  let imgElementsPlayer = player1Cards.querySelectorAll("img");
  imgElementsPlayer.forEach((img) => img.remove());

  // Remove as imagens das cartas do computador
  let imgElementsComputer = computerCards.querySelectorAll("img");
  imgElementsComputer.forEach((img) => img.remove());
}

// Exibe a carta selecionada no avatar do lado esquerdo
function drawSelectCard(id) {
  state.cardSprites.avatar.src = cardData[id].img;
  state.cardSprites.name.innerText = cardData[id].name;
  state.cardSprites.type.innerText = "Attribute : " + cardData[id].type;
}

// Esconde os detalhes da carta selecionada no avatar do lado esquerdo
function hideCardDetails() {
  state.cardSprites.avatar.src = "";
  state.cardSprites.name.innerText = "Selecione";
  state.cardSprites.type.innerText = "uma carta";
}

// Desenha um número específico de cartas em um lado do campo
async function drawCards(cardNumbers, fieldSide) {
  for (let i = 0; i < cardNumbers; i++) {
    const randomIdCard = getRandomCardID();
    const cardImage = await createCardImage(randomIdCard, fieldSide);
    document.getElementById(fieldSide).appendChild(cardImage);
  }
}

// Exibe o botão de "Próximo Duelo" com o texto do resultado
function drawButton(text) {
  state.actions.button.innerText = text;
  state.actions.button.style.display = "block";
}

// Reseta o duelo para um novo round
async function resetDuel() {
  hideCardDetails();
  state.actions.button.style.display = "none";

  // Esconde as cartas do campo de batalha
  state.fieldCard.player.style.display = "none";
  state.fieldCard.computer.style.display = "none";

  await removeAllCardImages();
  init();
}

// Toca o arquivo de áudio correspondente ao status do duelo
async function playAudio(status) {
  const audio = new Audio(`/src/assets/audios/${status}.wav`);
  try {
    await audio.play(); 
  } catch (error) {
    console.error(`Erro ao tocar áudio ${status}.wav:`, error);
  }
}

// Inicializa o jogo

function playBackgroundMusic() {
  const bgMusic = state.audios.backgroundMusic;
  if (bgMusic) { 
    bgMusic.volume = 0.01; 
    bgMusic.play().catch(error => {
      console.log("Autoplay de áudio bloqueado. Usuário precisa interagir para iniciar a música.", error);
      });
  }
}

function init() {
  // Garante que as cartas do campo estejam escondidas no início ou reset
  state.fieldCard.player.style.display = "none";
  state.fieldCard.computer.style.display = "none";

  drawCards(5, state.playerSides.player1); // Desenha 5 cartas para o jogador
  drawCards(5, state.playerSides.computer); // Desenha 5 cartas para o computador
  updateScore(); // Atualiza o placar inicial
    playBackgroundMusic(); 
}


// Inicia o jogo quando o script é carregado
init();