// snake.js

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCountX = 20; // Anzahl der Kacheln horizontal
const tileCountY = 20; // Anzahl vertikal

// Canvas-Größe dynamisch anpassen
canvas.width = gridSize * tileCountX;
canvas.height = gridSize * tileCountY;

let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let nextDirection = {x: 0, y: 0};
let food = {x: 15, y: 15};
let tailLength = 5;
let score = 0;
let gameOver = false;

function resetGame() {
  snake = [{x: 10, y: 10}];
  direction = {x: 0, y: 0};
  nextDirection = {x: 0, y: 0};
  tailLength = 5;
  score = 0;
  gameOver = false;
  placeFood();
}

function placeFood() {
  // Food zufällig platzieren, aber nicht auf der Schlange
  let valid = false;
  while(!valid) {
    food.x = Math.floor(Math.random()*tileCountX);
    food.y = Math.floor(Math.random()*tileCountY);
    valid = !snake.some(seg => seg.x === food.x && seg.y === food.y);
  }
}

// Steuerung mit Pfeiltasten
window.addEventListener('keydown', e => {
  if(gameOver && e.key === 'Enter') {
    resetGame();
    return;
  }
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
      if (direction.y !== 1) nextDirection = {x:0, y:-1};
      break;
    case 'ArrowDown':
    case 's':
      if (direction.y !== -1) nextDirection = {x:0, y:1};
      break;
    case 'ArrowLeft':
    case 'a':
      if (direction.x !== 1) nextDirection = {x:-1, y:0};
      break;
    case 'ArrowRight':
    case 'd':
      if (direction.x !== -1) nextDirection = {x:1, y:0};
      break;
  }
});

// Touchsteuerung (Swipe) für Mobilgeräte
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener('touchstart', e => {
  let touch = e.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener('touchend', e => {
  if(touchStartX === null || touchStartY === null) return;
  let touch = e.changedTouches[0];
  let dx = touch.clientX - touchStartX;
  let dy = touch.clientY - touchStartY;

  if(Math.abs(dx) > Math.abs(dy)) {
    if(dx > 30 && direction.x !== -1) nextDirection = {x:1, y:0};       // rechts
    else if(dx < -30 && direction.x !== 1) nextDirection = {x:-1, y:0}; // links
  } else {
    if(dy > 30 && direction.y !== -1) nextDirection = {x:0, y:1};        // runter
    else if(dy < -30 && direction.y !== 1) nextDirection = {x:0, y:-1};  // hoch
  }

  touchStartX = null;
  touchStartY = null;
});

function gameLoop() {
  if(gameOver) {
    drawGameOver();
    return;
  }

  // Update Richtung erst hier um gleichzeitiges Umdrehen zu verhindern
  if(nextDirection.x !== 0 || nextDirection.y !== 0) {
    direction = nextDirection;
  }
  if(direction.x === 0 && direction.y === 0) {
    drawStartScreen();
    return;
  }

  // Position aktualisieren
  let head = {...snake[snake.length - 1]};
  head.x += direction.x;
  head.y += direction.y;

  // Kanten Wrapping
  if(head.x < 0) head.x = tileCountX -1;
  if(head.x >= tileCountX) head.x = 0;
  if(head.y < 0) head.y = tileCountY -1;
  if(head.y >= tileCountY) head.y = 0;

  // Selbstkollision prüfen
  if(snake.some(part => part.x === head.x && part.y === head.y)) {
    gameOver = true;
  } else {
    snake.push(head);
  }

  // Schwanz begrenzen
  while(snake.length > tailLength) {
    snake.shift();
  }

  // Food essen
  if(head.x === food.x && head.y === food.y) {
    tailLength++;
    score++;
    placeFood();
  }

  draw();
}

function draw() {
  // Hintergrund
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Raster zeichnen (optional)
  ctx.strokeStyle = '#1a1a4d';
  ctx.lineWidth = 1;
  for(let i=0; i<=tileCountX; i++) {
    ctx.beginPath();
    ctx.moveTo(i*gridSize,0);
    ctx.lineTo(i*gridSize,canvas.height);
    ctx.stroke();
  }
  for(let j=0; j<=tileCountY; j++) {
    ctx.beginPath();
    ctx.moveTo(0,j*gridSize);
    ctx.lineTo(canvas.width,j*gridSize);
    ctx.stroke();
  }

  // Food zeichnen - als pulsierender Kreis
  const time = Date.now() / 500;
  const radius = gridSize/2 * (0.75 + 0.25 * Math.sin(time*3));
  const foodX = food.x * gridSize + gridSize/2;
  const foodY = food.y * gridSize + gridSize/2;
  const gradient = ctx.createRadialGradient(foodX, foodY, radius*0.3, foodX, foodY, radius);
  gradient.addColorStop(0, '#ff4d4d');
  gradient.addColorStop(1, '#aa0000');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(foodX, foodY, radius, 0, Math.PI*2);
  ctx.fill();

  // Schlange zeichnen - mit Farbverlauf
  for(let i=0; i<snake.length; i++) {
    let part = snake[i];
    let alpha = i / snake.length;
    let color = `rgba(50,255,50,${alpha + 0.3})`;
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0,255,0,0.7)';
    ctx.shadowBlur = 5;
    ctx.fillRect(part.x * gridSize+1, part.y * gridSize+1, gridSize-2, gridSize-2);
  }

  // Score anzeigen
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 10, 25);
}

function drawGameOver() {
  draw(); // letzte Spielsituation

  // Overlay
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0,0,canvas.width, canvas.height);

  // Text
  ctx.fillStyle = 'red';
  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 20);
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Dein Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
  ctx.fillText('Drücke Enter oder tippe zum Neustart', canvas.width/2, canvas.height/2 + 60);
}

// Starte Bildschirm anzeigen wenn nicht gestartet
function drawStartScreen() {
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Willkommen bei Snake!', canvas.width/2, canvas.height/2 - 40);
  ctx.font = '18px Arial';
  ctx.fillText('Benutze Pfeiltasten oder wische zur Steuerung', canvas.width/2, canvas.height/2);
  ctx.fillText('Drücke eine Taste oder wische, um zu starten', canvas.width/2, canvas.height/2 + 40);
}

resetGame();
setInterval(gameLoop, 100);
