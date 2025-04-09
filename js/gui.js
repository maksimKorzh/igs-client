var canvas, ctx, cell;
var editMode = 0;
var takePlace = 0;
var gameOver = 1;
var userSide = BLACK;
var blackTime = 0;
var whiteTime = 0;
var intervalId;

const bgImage = new Image();
const blackStoneImage = new Image();
const whiteStoneImage = new Image();
const moveSound = new Audio('./assets/112-2052.wav');
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

function drawBoard() {
  cell = canvas.width / (size-2);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (let i = 0; i < size-2; i++) {
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
  for (let row = 0; row < size-2; row++) {
    for (let col = 0; col < size-2; col++) {
      let sq = (row+1) * size + (col+1);
      let starPoints = {
         9: [36, 38, 40, 58, 60, 62, 80, 82, 84],
        13: [64, 67, 70, 109, 112, 115, 154, 157, 160],
        19: [88, 94, 100, 214, 220, 226, 340, 346, 352]
      }
      if ([9, 13, 19].includes(size-2) && starPoints[size-2].includes(sq)) {
        ctx.beginPath();
        ctx.arc(col * cell+(cell/4)*2, row * cell +(cell/4)*2, cell / 6 - 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (board[sq] == 7) continue;
      const stoneImage = board[sq] == 1 ? blackStoneImage : whiteStoneImage;
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
  let sq = (row+1) * size + (col+1);
  if (editMode) {
    setStone(sq, side);
    drawBoard();
  } else {
    if (board[sq] != EMPTY) side = userSide;
    if (gameOver || side != userSide) return;
    let move = {"i": [92, table, 0, (row * 19 + col), 0]};
    let message = JSON.stringify(move);
    ipcRenderer.send('main', message);
  }
}

function sendMessage(action) {
  if (action == 'connect') {
    ipcRenderer.send('main', action);
    return;
  }

  table = parseInt(document.getElementById('table').value);
  if (!(table in games)) {
    alert('Choose valid table');
    return;
  }
  let command = {"i": [], "s": []};
  switch (action) {
    case 'tg':
      command.i = [82, table, parseInt(document.getElementById('tg').value)];
      command.s = ['tg'];
      break;
    case 'tm':
      command.i = [82, table, parseInt(document.getElementById('tm').value)];
      command.s = ['tm'];
      break;
    case 'join':
      startInterval();
      document.getElementById('rank').value = '3000';
      command.i = [72, table];
      logs = '';
      break;
    case 'leave':
      stopInterval();
      command.i = [73, table];
      initGoban();
      drawBoard();
      logs = '';
      games = {};
      takePlace = 0;
      break;
    case 'black':
      userSide = BLACK;
      command.i = [(takePlace ? 84:83), table, 0];
      takePlace ^= 1;
      break;
    case 'white':
      userSide = WHITE;
      command.i = [(takePlace ? 84:83), table, 1];
      takePlace ^= 1;
      break;
    case 'start':
      command.i = [85, table];
      gameOver = 0;
      break;
    case 'pass':
      command.i = [92, table, 0, 400, 0];
      break;
    case 'resign':
      command.i = [93, table, 4, 0];
      gameOver = 1;
      break;
    case 'chat':
      let chat = document.getElementById('chat');
      command.i = [81, table];
      command.s = [chat.value];
      chat.value = '';
      break;
  }
  let message = JSON.stringify(command);
  ipcRenderer.send('main', message);
}

function createGame() {
  let command = {"i": [71], "s": []};
  let message = JSON.stringify(command);
  ipcRenderer.send('main', message);
}

function playerInfo() {
  userName = document.getElementById('info').value;
  fetch('https://www.playok.com/en/stat.phtml?u=' + userName + '&g=go')
  .then(response => { return response.text(); })
  .then(html => {
    let rating = html.split('ranking: <b>').slice(-1)[0].split('</b>')[0];
    if (rating.length > 4) {
      alert('No info available');
      return;
    }
    let games = html.split('games played: <b>').slice(-1)[0].split('</b>')[0];
    let wins = html.split('wins: <b>').slice(-1)[0].split('</b>')[0];
    let losses = html.split('losses: <b>').slice(-1)[0].split('</b>')[0];
    let winrate = html.split('(<b>').slice(-1)[0].split('</b>')[0];
    let abandoned = html.split('abandoned: <b>').slice(-1)[0].split('</b>')[0];
    let streak = html.split('streak: <b>').slice(-1)[0].split('</b>')[0];
    let country = html.split(' - <a href="/en/go/">go</a>').slice(-1)[0].split('<b>').slice(-1)[0].split('</b>')[0].slice(1,-1);
    let online = html.split('registered').slice(-1)[0].includes('online') ? 'online': 'offline';
    fetch('https://www.playok.com/en/stat.phtml?u=' + userName + '&g=go&sk=2')
    .then(response => { return response.text(); })
    .then(html => {
      let results = html.split('td').slice(6,);
      let recentResults = '';
      for (let i in results) {
        try {
          if (i > 72) break;
          let value = results[i].split('<b>')[1].split('</b>')[0];
          recentResults += value.replace('win', '🟢').replace('loss', '❌');
        } catch (e) {}
      }
      alert(
        'Rank:\t\t' + getRank(parseInt(rating)) +
        '\nRating:\t\t' + rating +
        '\nGames:\t\t' + games +
        '\nWins:\t\t' + wins +
        '\nLosses:\t\t' + losses +
        '\nWinrate:\t' + winrate +
        '\nStreak:\t\t' + streak +
        '\nLeaft:\t\t' + abandoned +
        '\nLanguage:\t' + country +
        '\nStatus:\t\t' + online +
        '\nRecent:\t\t' + recentResults + '\n'
      );
    });
  })
}

function copyGame() {
  loadSgf(document.getElementById('chat').value);
  userName = document.getElementById('info').value;
  fetch('https://www.playok.com/en/stat.phtml?u=' + userName + '&g=go&sk=2')
  .then(response => { return response.text(); })
  .then(html => {
    let lastGame = html.split('.txt')[0].split('go').slice(-1)[0];
    if (lastGame.length > 10) {
      alert('No such user');
      return;
    }
    let lastGameUrl = 'https://www.playok.com/p/?g=go' + lastGame + '.txt';
    fetch(lastGameUrl)
    .then( response => { return response.text(); })
    .then(sgf => {
      navigator.clipboard.writeText(sgf);
    });
  });
}

function handleEval() {
 (async () => {
   if (editMode) alert(await evaluatePosition());
   else {
     if(table in games) alert(await evaluatePosition());
     else alert('Choose valid table');
   }
 })();
}

function handleAI() {
  if (editMode) playMove();
  else {
    if (!gameOver && side == userSide) playMove();
    else alert('Choose valid table');
  }
}

function changeMode(btn) {
  editMode ^= 1;
  if (editMode) alert('Edit mode enabled');
  else alert('Edit mode disabled');
}

function updateTimer() {
  if (blackTime < 0 || whiteTime < 0) return;
  document.getElementById('blackTime').innerHTML = secToMin(blackTime);
  document.getElementById('whiteTime').innerHTML = secToMin(whiteTime);
}

function getTime(time) {
  let totalSeconds = 0;
  let currentNumber = '';
  for (let char of time) {
    if (char === '+' || char === '-') {
      if (currentNumber) {
        totalSeconds += parseInt(currentNumber, 10) * 60; // Convert to seconds
        currentNumber = '';
      };currentNumber += char;
    } else if (!isNaN(char)) currentNumber += char;
  }
  if (currentNumber) totalSeconds += parseInt(currentNumber, 10) * 60;
  return totalSeconds;
}

function secToMin(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startInterval() {
  if (!intervalId) { // Prevent multiple intervals from being set
    intervalId = setInterval(() => {
      side == BLACK ? (blackTime -= 1) :(whiteTime -= 1);
      updateTimer();
    }, 1000);
  }
}

function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      blackTime = 0;
      whiteTime = 0;
      updateTimer();
    }
}

function resizeCanvas() {
  canvas.width = window.innerHeight-34;
  canvas.height = canvas.width;
  drawBoard();
  document.getElementById('terminal').innerHTML = `
    <pre id="output" style="width: ` + (canvas.width-220) + `px; height: ` + (canvas.width-38) + `px; color: white; font-family: monospace; font-size: calc(100vw/113); overflow: auto;"></pre>
    <input id="input" placeholder="Type a command..." style="width: ` + (canvas.width-230) + `px;" autofocus>
  `;
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
  initGoban();
  resizeCanvas();
})();
