const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const generarPDF = require('./generarPdf'); // Importamos la función para generar PDF
const excel = require('exceljs');
const { format } = require('date-fns'); // Agregamos esta línea para importar la función 'format'


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
    console.log('Número de la primer factura:', lastNumber);

    console.log('Datos del JSON:', students); // Opcional: muestra los datos en la consola
  } catch (error) {
    console.error('Error al procesar el JSON:', error);
  }
});

// Evento para mostrar el diálogo de selección de directorio al recibir el evento 'select-directory'
ipcMain.on('select-directory', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Seleccione un directorio para guardar los PDFs',
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedDirectory = result.filePaths[0];
      if (students.length > 0 && lastNumber !== null) {
        generarPDF(students, lastNumber, selectedDirectory); // Llamamos a la función para generar los PDFs
      } else {
        console.error('Error: No se pueden generar los PDFs. Asegúrate de cargar los datos primero.');
      }
    }
  }).catch(err => {
    console.error('Error al mostrar el diálogo de selección de directorio:', err);
  });
});

// ... (código existente)

// Función para generar el archivo Excel con la lista de facturas
function generarListaExcel(students, lastNumber, selectedDirectory) {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet('Lista de Facturas');

  // Establecer los encabezados de las columnas
  worksheet.columns = [
    { header: 'NUMERO DE FACTURA', key: 'num_factura', width: 20 },
    { header: 'NOMBRE DEL ALUMNO', key: 'nombre_alumno', width: 30 },
    { header: 'FECHA', key: 'fecha', width: 15 },
    { header: 'IMPORTE NETO', key: 'importe_neto', width: 15 },
    { header: 'IMPORTE BRUTO', key: 'importe_bruto', width: 15 },
  ];

  // Agregar filas con los datos de cada estudiante
  students.forEach((student, index) => {
    const currentNumber = lastNumber + index;
    const fecha = format(new Date(), 'dd/MM/yyyy');
    const row = worksheet.addRow({
      num_factura: `20230${currentNumber}`,
      nombre_alumno: student.ALUMNO,
      fecha: fecha,
      importe_neto: student['TOTAL A PAGAR'],
      importe_bruto: student['TOTAL A PAGAR'],
    });

    row.commit();
  });

  // Guardar el archivo Excel en el directorio seleccionado
  const excelFilePath = path.join(selectedDirectory, 'lista_facturas.xlsx');
  workbook.xlsx.writeFile(excelFilePath)
    .then(() => {
      console.log('Archivo Excel generado y guardado:', excelFilePath);
    })
    .catch((error) => {
      console.error('Error al generar el archivo Excel:', error);
    });
}


// Evento para generar la lista Excel al recibir el evento 'generate-excel-list'
ipcMain.on('generate-excel-list', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Seleccione un directorio para guardar la lista de facturas en Excel',
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedDirectory = result.filePaths[0];
      if (students.length > 0 && lastNumber !== null) {
        generarListaExcel(students, lastNumber, selectedDirectory);
      } else {
        console.error('Error: No se pueden generar los datos para la lista Excel. Asegúrate de cargar los datos primero.');
      }
    }
  }).catch(err => {
    console.error('Error al mostrar el diálogo de selección de directorio:', err);
  });
});

