const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const net = require('net');

let client;

function createWindow() {
  const win = new BrowserWindow({
    width: 1720,
    minWidth:1720,
    height: 1000,
    webPreferences: {
      preload: __dirname + '/preload.js'
    }
  });
  const template = [
    {
      label: 'View',
      submenu: [
        { label: 'Reload', role: 'reload' },
        { label: 'Toggle Developer Tools', role: 'toggleDevTools' },
        { label: 'Fullscreen', role: 'togglefullscreen' },
        { label: 'Exit', role: 'quit' },
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('connect-to-igs', (event) => {
  client = net.createConnection({ host: 'igs.joyjoy.net', port: 6969 }, () => {
    console.log('Connected to IGS');
  });

  client.on('data', (data) => {
    event.sender.send('telnet-data', data.toString());
  });

  client.on('end', () => {
    event.sender.send('telnet-data', '\nDisconnected from server.\n');
  });
});

ipcMain.on('send-command', (event, command) => {
  if (client) {
    client.write(command + '\n');
  }
});
