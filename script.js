// Configuration du jeu
const CONFIG = {
  gameTime: 60, // secondes
  gravity: 0.5,
  basketScore: 2,
  ballRadius: 15,
  basketWidth: 80,
  basketHeight: 15,
};

// Variables du jeu
let canvas, ctx;
let gameState = "start"; // 'start', 'playing', 'gameover'
let score = 0;
let timeLeft = CONFIG.gameTime;
let timerInterval = null;

// Objets du jeu
let ball = null;
let baskets = [];
let dragStart = null;
let isAiming = false;
let particles = [];

// Initialisation
document.addEventListener("DOMContentLoaded", init);

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  // Définir les dimensions du canvas
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Événements
  document.getElementById("start-btn").addEventListener("click", startGame);
  document.getElementById("restart-btn").addEventListener("click", restartGame);

  canvas.addEventListener("mousedown", handleMouseDown);
  // Attacher mousemove et mouseup au document pour permettre le suivi en dehors du canvas
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchend", handleTouchEnd);

  // Initialiser les paniers
  initBaskets();

  // Boucle de jeu
  gameLoop();
}

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  initBaskets();
}

function initBaskets() {
  baskets = [
    {
      x: canvas.width * 0.25 - CONFIG.basketWidth / 2,
      y: canvas.height * 0.3,
      width: CONFIG.basketWidth,
      height: CONFIG.basketHeight,
      color: "#FF6B6B",
    },
    {
      x: canvas.width * 0.5 - CONFIG.basketWidth / 2,
      y: canvas.height * 0.25,
      width: CONFIG.basketWidth,
      height: CONFIG.basketHeight,
      color: "#4ECDC4",
    },
    {
      x: canvas.width * 0.75 - CONFIG.basketWidth / 2,
      y: canvas.height * 0.3,
      width: CONFIG.basketWidth,
      height: CONFIG.basketHeight,
      color: "#FFE66D",
    },
  ];
}

function startGame() {
  gameState = "playing";
  score = 0;
  timeLeft = CONFIG.gameTime;
  updateScore();
  updateTimer();

  document.getElementById("start-screen").classList.add("hidden");

  // Démarrer le timer
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  resetBall();
}

function restartGame() {
  document.getElementById("game-over-screen").classList.add("hidden");
  particles = [];
  startGame();
}

function endGame() {
  gameState = "gameover";
  clearInterval(timerInterval);

  document.getElementById("final-score").textContent = score;
  document.getElementById("game-over-screen").classList.remove("hidden");
}

function resetBall() {
  ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    vx: 0,
    vy: 0,
    radius: CONFIG.ballRadius,
    isMoving: false,
    hasScored: false,
  };
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function updateTimer() {
  document.getElementById("timer").textContent = timeLeft;
}

// Gestion des événements souris
function handleMouseDown(e) {
  if (gameState !== "playing" || ball.isMoving) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const dist = Math.hypot(ball.x - x, ball.y - y);
  if (dist < ball.radius * 2) {
    isAiming = true;
    dragStart = { x, y };
  }
}

function handleMouseMove(e) {
  if (!isAiming) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  dragStart.currentX = x;
  dragStart.currentY = y;
}

function handleMouseUp(e) {
  if (!isAiming) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  shootBall(x, y);
  isAiming = false;
  dragStart = null;
}

// Gestion des événements tactiles
function handleTouchStart(e) {
  e.preventDefault();
  if (gameState !== "playing" || ball.isMoving) return;

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  const dist = Math.hypot(ball.x - x, ball.y - y);
  if (dist < ball.radius * 2) {
    isAiming = true;
    dragStart = { x, y };
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!isAiming) return;

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  dragStart.currentX = x;
  dragStart.currentY = y;
}

function handleTouchEnd(e) {
  e.preventDefault();
  if (!isAiming || !dragStart.currentX) return;

  shootBall(dragStart.currentX, dragStart.currentY);
  isAiming = false;
  dragStart = null;
}

function shootBall(endX, endY) {
  const dx = ball.x - endX;
  const dy = ball.y - endY;

  const power = Math.min(Math.hypot(dx, dy) / 100, 2);

  ball.vx = dx * power * 0.25;
  ball.vy = dy * power * 0.25;
  ball.isMoving = true;
  ball.hasScored = false;
}

function updateBall() {
  if (!ball.isMoving) return;

  // Appliquer la gravité
  ball.vy += CONFIG.gravity;

  // Mettre à jour la position
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Vérifier les collisions avec les bords
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
    ball.vx *= -0.7;
    ball.x = Math.max(
      ball.radius,
      Math.min(canvas.width - ball.radius, ball.x)
    );
  }

  // Si le ballon sort de l'écran par le bas
  if (ball.y - ball.radius > canvas.height) {
    resetBall();
    return;
  }

  // Vérifier les collisions avec les paniers
  checkBasketCollision();
}

function checkBasketCollision() {
  if (ball.hasScored) return;

  baskets.forEach((basket) => {
    // Vérifier si le ballon traverse le panier par le haut
    if (
      ball.vy > 0 && // Le ballon descend
      ball.y - ball.radius < basket.y + basket.height &&
      ball.y + ball.radius > basket.y &&
      ball.x > basket.x &&
      ball.x < basket.x + basket.width
    ) {
      score += CONFIG.basketScore;
      updateScore();
      ball.hasScored = true;

      // Créer des particules
      createParticles(ball.x, basket.y, basket.color);

      // Réinitialiser le ballon après un court délai
      setTimeout(() => {
        if (gameState === "playing") {
          resetBall();
        }
      }, 500);
    }
  });
}

function createParticles(x, y, color) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
      color: color,
    });
  }
}

function updateParticles() {
  particles = particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life -= 0.02;
    return p.life > 0;
  });
}

function gameLoop() {
  // Nettoyer le canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner le fond du terrain
  drawBackground();

  // Dessiner les paniers
  drawBaskets();

  if (gameState === "playing") {
    // Mettre à jour et dessiner le ballon
    updateBall();
    drawBall();

    // Dessiner la visée
    if (isAiming && dragStart) {
      drawAimLine();
    }

    // Mettre à jour et dessiner les particules
    updateParticles();
    drawParticles();
  }

  requestAnimationFrame(gameLoop);
}

function drawBackground() {
  // Dessiner un fond de terrain
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB");
  gradient.addColorStop(1, "#E0F6FF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessiner le sol
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
}

function drawBaskets() {
  baskets.forEach((basket) => {
    // Panneau arrière
    ctx.fillStyle = basket.color;
    ctx.fillRect(basket.x - 5, basket.y - 40, basket.width + 10, 40);

    // Cercle du panier
    ctx.strokeStyle = "#FF4500";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(
      basket.x + basket.width / 2,
      basket.y,
      basket.width / 2,
      10,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Filet
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 7) * i;
      const startX =
        basket.x + basket.width / 2 + (Math.cos(angle) * basket.width) / 2;
      const startY = basket.y;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(basket.x + basket.width / 2, basket.y + 20);
      ctx.stroke();
    }
  });
}

function drawBall() {
  if (!ball) return;

  // Ombre du ballon
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(ball.x, canvas.height - 20, ball.radius, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ballon
  const gradient = ctx.createRadialGradient(
    ball.x - 5,
    ball.y - 5,
    0,
    ball.x,
    ball.y,
    ball.radius
  );
  gradient.addColorStop(0, "#FF8C00");
  gradient.addColorStop(1, "#FF4500");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // Lignes du ballon
  ctx.strokeStyle = "#8B4513";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(ball.x - ball.radius, ball.y);
  ctx.lineTo(ball.x + ball.radius, ball.y);
  ctx.stroke();
}

function drawAimLine() {
  if (!dragStart.currentX) return;

  const dx = ball.x - dragStart.currentX;
  const dy = ball.y - dragStart.currentY;

  // Flèche de visée
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  ctx.lineTo(ball.x + dx * 0.5, ball.y + dy * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Indicateur de puissance
  const power = Math.min(Math.hypot(dx, dy) / 50, 3);
  ctx.fillStyle = `rgba(255, 255, 255, ${power / 3})`;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius + 10 * power, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}
