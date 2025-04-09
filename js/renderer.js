window.telnetAPI.connect();

const output = document.getElementById('output');
const input = document.getElementById('input');

window.telnetAPI.onData((data) => {
  output.textContent += data;
  output.scrollTop = output.scrollHeight;
  // Sync telnet and GUI board
  if (data.includes('A B C D E F G')) {
    data = data.replace('>>', '>|');
    data = data.replace('<<', '|<');
    clearBoard();
    let boardStr = data.split('|');
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
            } else if (col == '<') {
              userMove = sq-1;
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
