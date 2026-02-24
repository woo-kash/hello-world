/**
 * Electron main process — wraps the React Native Web app for Mac/Windows.
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

const REACT_NATIVE_PORT = process.env.ELECTRON_START_URL || 'http://localhost:8081';

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 768,
    minHeight: 600,
    title: 'VibeQuest',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,  // Allow direct API calls from renderer (desktop-only app)
    },
  });

  win.loadURL(REACT_NATIVE_PORT);
  win.webContents.openDevTools();

  // Pass API key from environment to renderer safely
  win.webContents.on('did-finish-load', () => {
    // Note: API key should be handled server-side in production
    // For dev, proxy requests through a local backend
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
