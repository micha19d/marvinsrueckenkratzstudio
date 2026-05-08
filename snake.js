// snake.js

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let food = {x: 15, y: 15};
let tailLength = 5;

// Steuerung mit Pfeiltasten
window.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp':
      if (direction.y == 1) break;
      direction = {x:0, y:-1};
      break;
    case 'ArrowDown':
      if (direction.y == -1) break;
      direction = {x:0, y:1};
      break;
    case 'ArrowLeft':
      if (direction.x == 1) break;
      direction = {x:-1, y:0};
      break;
    case 'ArrowRight':
      if (direction.x == -1) break;
      direction = {x:1, y:0};
      break;
  }
});

function gameLoop() {
  // Position aktualisieren
  let head = {...snake[snake.length - 1]};
  head.x += direction.x;
  head.y += direction.y;

  // Kanten Wrapping (durch Wand gehen)
  if(head.x < 0) head.x = tileCount -1;
  if(head.x >= tileCount) head.x = 0;
  if(head.y < 0) head.y = tileCount -1;
  if(head.y >= tileCount) head.y = 0;

  // Kollisionsabfrage mit Snake selbst
  for(let part of snake) {
    if(part.x === head.x && part.y === head.y) {
      // Spiel zurücksetzen
      tailLength = 5;
      snake = [{x:10, y:10}];
      direction = {x:0, y:0};
    }
  }

  snake.push(head);

  // Wenn Schlange länger als Tail-Length, entferne erstes Segment
  while(snake.length > tailLength) {
    snake.shift();
  }

  // Prüfen ob Food gegessen wurde
  if(head.x === food.x && head.y === food.y) {
    tailLength++;
    // Neue Position für Food zufällig
    food.x = Math.floor(Math.random()*tileCount);
    food.y = Math.floor(Math.random()*tileCount);
  }

  // Spielfeld zeichnen
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Food zeichnen
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Snake zeichnen
  ctx.fillStyle = 'lime';
  for(let part of snake) {
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize-2, gridSize-2);
  }
}

// Spiel-Schleife alle 100ms
setInterval(gameLoop, 100);
