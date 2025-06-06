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
  playerSides: {
    player1: "player-cards",
    player1Box: document.querySelector("#player-cards"),
    computer: "computer-cards",
    computerBox: document.querySelector("#computer-cards"),
  },
  actions: {
    button: document.getElementById("next-duel"),
  },
    audios: {
    backgroundMusic: document.getElementById("background-music"),
  },
};

const cardData = [
  {
    id: 0,
    name: "Blue Eyes White Dragon",
    type: "Paper",
    img: "src/assets/icons/dragon.png",
    WinOf: [1],
    LoseOf: [2],
  },
  {
    id: 1,
    name: "Dark Magician",
    type: "Rock",
    img: "src/assets/icons/magician.png",
    WinOf: [2],
    LoseOf: [0],
  },
  {
    id: 2,
    name: "Exodia",
    type: "Scissor",
    img: "src/assets/icons/exodia.png",
    WinOf: [0],
    LoseOf: [1],
  },
];

function getRandomCardID() {
  const randomIndex = Math.floor(Math.random() * cardData.length);
  return cardData[randomIndex].id;
}

async function createCardImage(idCard, fieldSide) {
  const cardImage = document.createElement("img");
  cardImage.setAttribute("height", "100px");
  cardImage.setAttribute("src", "src/assets/icons/card-back.png");
  cardImage.setAttribute("data-id", idCard);
  cardImage.classList.add("card");

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

async function setCardsField(cardId) {
  await removeAllCardImages();
  hideCardDetails();

  const computerCardId = getRandomCardID();

  state.fieldCard.player.style.display = "block";
  state.fieldCard.computer.style.display = "block";

  state.fieldCard.player.src = cardData[cardId].img;
  state.fieldCard.computer.src = cardData[computerCardId].img;

  const duelResults = await checkDuelResults(Number(cardId), computerCardId);
  await updateScore();
  await drawButton(duelResults);
}

function updateScore() {
  state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

async function checkDuelResults(playerCardID, computerCardId) {
  let duelResults = "EMPATE";

  const playerCard = cardData[playerCardID];

  if (playerCard.WinOf.includes(computerCardId)) {
    duelResults = "GANHOU!";
    await playAudio("win");
    state.score.playerScore++;
  } else if (playerCard.LoseOf.includes(computerCardId)) {
    duelResults = "PERDEU";
    await playAudio("lose");
    state.score.computerScore++;
  } else {
    await playAudio("draw");
  }

  return duelResults;
}

async function removeAllCardImages() {
  let player1Cards = state.playerSides.player1Box;
  let computerCards = state.playerSides.computerBox;

  let imgElementsPlayer = player1Cards.querySelectorAll("img");
  imgElementsPlayer.forEach((img) => img.remove());

  let imgElementsComputer = computerCards.querySelectorAll("img");
  imgElementsComputer.forEach((img) => img.remove());
}

function drawSelectCard(id) {
  state.cardSprites.avatar.src = cardData[id].img;
  state.cardSprites.name.innerText = cardData[id].name;
  state.cardSprites.type.innerText = "Attribute : " + cardData[id].type;
}

function hideCardDetails() {
  state.cardSprites.avatar.src = "";
  state.cardSprites.name.innerText = "Selecione";
  state.cardSprites.type.innerText = "uma carta";
}

async function drawCards(cardNumbers, fieldSide) {
  for (let i = 0; i < cardNumbers; i++) {
    const randomIdCard = getRandomCardID();
    const cardImage = await createCardImage(randomIdCard, fieldSide);
    document.getElementById(fieldSide).appendChild(cardImage);
  }
}

function drawButton(text) {
  state.actions.button.innerText = text;
  state.actions.button.style.display = "block";
}

async function resetDuel() {
  hideCardDetails();
  state.actions.button.style.display = "none";

  state.fieldCard.player.style.display = "none";
  state.fieldCard.computer.style.display = "none";

  await removeAllCardImages();
  init();
}

async function playAudio(status) {
  const audio = new Audio(`src/assets/audios/${status}.wav`);
  try {
    await audio.play(); 
  } catch (error) {
    console.error(`Erro ao tocar áudio ${status}.wav:`, error);
  }
}

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
  state.fieldCard.player.style.display = "none";
  state.fieldCard.computer.style.display = "none";

  drawCards(5, state.playerSides.player1);
  drawCards(5, state.playerSides.computer);
  updateScore();
  playBackgroundMusic(); 
}

init();