const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let students = [];
let lastNumber = null; // Variable para almacenar el número de la última factura

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
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

// Evento para recibir el contenido JSON y el número de la última factura desde la interfaz
ipcMain.on('load-data', (event, data) => {
  const { jsonContent, lastNumberInput } = data;

  try {
    students = JSON.parse(jsonContent);

    // Almacena el número de la última factura en la variable lastNumber
    lastNumber = parseInt(lastNumberInput, 10); // Convierte el valor a entero si es necesario
    console.log('Número de la última factura:', lastNumber);

    // Utiliza el número de la última factura (lastNumber) y los datos del JSON para generar los PDFs de las facturas
    // Puedes implementar la lógica de generación de PDFs aquí

    console.log('Datos del JSON:', students); // Opcional: muestra los datos en la consola
  } catch (error) {
    console.error('Error al procesar el JSON:', error);
  }
});
