window.telnetAPI.connect();

const output = document.getElementById('output');
const input = document.getElementById('input');

window.telnetAPI.onData((data) => {
  output.textContent += data;
  output.scrollTop = output.scrollHeight;
  // TODO: improve board parsing - switch games, userMove 
  // Sync telnet and GUI board
  if (data.includes('A B C D E F G')) {
    clearBoard();
    let boardStr = data.split('\n').slice(2, -2);
    for (let l in boardStr) boardStr[l] = boardStr[l].slice(6, 43);
    console.log(boardStr);
    let rank = 0;
    for (let row in boardStr) {
      if (boardStr[row].length == 37) {
        let file = 0;
        let line = boardStr[row].replaceAll(' ', '');
        for (let col of line) {
          let sq = rank * size + file;
          if (col == '>' || col == '<') {
            if (col == '>') {
              userMove = sq;
              moveSound.play();
            } continue;
          }
          if (col == '#') board[sq] = BLACK;
          if (col == 'O') board[sq] = WHITE;
          file++;
        } rank++;
      }
    } drawBoard();
  }
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const cmd = input.value;
    window.telnetAPI.sendCommand(cmd);
    input.value = '';
    let terminal = document.getElementById('output');
    terminal.scrollTop = terminal.scrollHeight;
  }
});
