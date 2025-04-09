window.telnetAPI.connect();

const output = document.getElementById('output');
const input = document.getElementById('input');

window.telnetAPI.onData((data) => {
  output.textContent += data;
  output.scrollTop = output.scrollHeight;
  doCommand(data);
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
