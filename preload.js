const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('telnetAPI', {
  connect: () => ipcRenderer.send('connect-to-igs'),
  sendCommand: (cmd) => ipcRenderer.send('send-command', cmd),
  onData: (callback) => ipcRenderer.on('telnet-data', (_, data) => callback(data))
});
