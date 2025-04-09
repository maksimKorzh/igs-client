// Intercept IGS command for GUI
function doCommand(message) {
  // Load game
  if (message.includes('A B C D E F G')) {
    clearBoard();
    let boardStr = message.split('|');
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
}

