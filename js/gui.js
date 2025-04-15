const EMPTY = 0
const BLACK = 1
const WHITE = 2
const bgImage = new Image();
const blackStoneImage = new Image();
const whiteStoneImage = new Image();
const moveSound = new Audio('./assets/112-2052.wav');

var canvas, ctx, cell;
var board = [];
var size = 19;
var userMove = -1;

bgImage.src = './assets/board_fox.png';
blackStoneImage.src = './assets/stone_b_fox.png';
whiteStoneImage.src = './assets/stone_w_fox.png';
let imagesLoaded = false;
bgImage.onload = blackStoneImage.onload = whiteStoneImage.onload = () => {
  if (bgImage.complete && blackStoneImage.complete && whiteStoneImage.complete) {
    imagesLoaded = true;
    drawBoard();
  }
};

function clearBoard() {
  board = [];
  userMove = -1;
  for (let sq = 0; sq < size ** 2; sq++)
    board[sq] = EMPTY;
}

function drawBoard() {
  cell = canvas.width / size;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (let i = 0; i < size; i++) {
    const x = i * cell + cell / 2;
    const y = i * cell + cell / 2;
    let offset = cell * 2 - cell / 2 - cell;
    ctx.moveTo(offset, y);
    ctx.lineTo(canvas.width - offset, y);
    ctx.moveTo(x, offset);
    ctx.lineTo(x, canvas.height - offset);
  };
  ctx.lineWidth = 1;
  ctx.stroke();
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      let sq = row * size + col;
      let starPoints = [60, 66, 72, 174, 180, 186, 288, 294, 300];
      if (starPoints.includes(sq)) {
        ctx.beginPath();
        ctx.arc(col * cell+(cell/4)*2, row * cell +(cell/4)*2, cell / 6 - 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      const stoneImage = board[sq] == BLACK ? blackStoneImage : whiteStoneImage;
      if (board[sq]) {
        ctx.drawImage(
          stoneImage,
          col * cell + cell / 2 - cell / 2,
          row * cell + cell / 2 - cell / 2,
          cell,
          cell
        );
      }
      
      if (sq == userMove) {
        let color = board[sq] == 1 ? 'white' : 'black';
        ctx.beginPath();
        ctx.arc(col * cell+(cell/4)*2, row * cell+(cell/4)*2, cell / 5 - 2, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}

function userInput(event) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;
  let col = Math.floor(mouseX / cell);
  let row = Math.floor(mouseY / cell);
  let sq = 'ABCDEFGHJKLMNOPQRST'[col] + (19-row);
  window.telnetAPI.sendCommand(sq);
}

function resizeCanvas() {
  canvas.width = window.innerHeight-34;
  canvas.height = canvas.width;
  drawBoard();
  try {
    document.getElementById('output').style.width = canvas.width-220 + 'px';
    document.getElementById('output').style.height = canvas.width-44 + 'px';
    document.getElementById('input').style.width = canvas.width-230 + 'px';
  } catch (e) {}
}

(function initGUI() {
  let container = document.getElementById('goban');
  canvas = document.createElement('canvas');
  canvas.style = 'border: 2px solid black; margin: 4px; margin-top: 16px;';
  container.appendChild(canvas);
  canvas.addEventListener('click', userInput);
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  window.addEventListener('resize', resizeCanvas);
  clearBoard();
  resizeCanvas();
  document.getElementById('terminal').innerHTML = `
    <pre id="output" style="width: ` + (canvas.width-220) + `px; height: ` + (canvas.width-44) + `px; color: white; font-family: monospace; font-size: calc(100vw/113); overflow: auto;"></pre>
    <input id="input" spellcheck="false" placeholder="Type a command..." style="width: ` + (canvas.width-230) + `px; font-size: 18px;" autofocus>
  `;
})();
