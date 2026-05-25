const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.argv.includes('--dev');

if (!isDev) {
  process.env.DB_PATH = path.join(app.getPath('userData'), 'data.sqlite');
  process.env.UPLOADS_DIR = path.join(app.getPath('userData'), 'uploads');
}

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  const loadUrl = isDev
    ? 'http://localhost:5173/'
    : 'http://localhost:3001/';

  await mainWindow.loadURL(loadUrl);
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  if (!isDev) {
    const { startServer } = require(path.join(__dirname, '../backend/dist/index.js'));
    await startServer(3001, path.join(__dirname, '../frontend/dist'));
  }
  await createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
