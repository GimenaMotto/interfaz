const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let students = []

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Deshabilitar nodeIntegration
      contextIsolation: true, // Habilitar el aislamiento de contexto
      enableRemoteModule: false, // Deshabilitar enableRemoteModule
      preload: path.join(__dirname, 'preload.js') // Agregar el archivo preload.js
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Evento para recibir el contenido JSON desde la interfaz
ipcMain.on('load-json-file', (event, jsonContent) => {
  try {
    students = JSON.parse(jsonContent);
    console.log(students); // Opcional: muestra los datos en la consola
  } catch (error) {
    console.error('Error al procesar el JSON:', error);
  }
});
