const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const url = require('url')
const generarPDF = require('./generarPdf')
const excel = require('exceljs')
const { format } = require('date-fns')
const nodemailer = require('nodemailer');

let mainWindow
let students = []
let lastNumber = null // Variable para almacenar el número de factura
let selectedDirectoryForEmails = null; // Variable para almacenar el directorio seleccionado para los correos
let dateInputGlobal = ''; // Variable global para almacenar la fecha
let monthInputGlobal = ''; // Variable global para almacenar el mes

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
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', () => {
    mainWindow = null;
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// para recibir el contenido JSON y el número de factura
ipcMain.on('load-data', (event, data) => {
  const { jsonContent, lastNumberInput, dateInput, monthInput } = data;

  try {
    students = JSON.parse(jsonContent)

    // Almacena el número 
    lastNumber = parseInt(lastNumberInput, 10) // convierte el valor a entero si es necesario
    console.log('Número de la primer factura:', lastNumber)
    console.log('Fecha:', dateInput); // Muestra la fecha en la consola
    console.log('Mes:', monthInput); // Muestra el mes en la consola

        // Almacena el mes
        monthInputGlobal = monthInput;
        console.log('Mes almacenado:', monthInputGlobal);

    console.log('Datos del JSON:', students) //muestra los datos en la consola
  } catch (error) {
    console.error('Error al procesar el JSON:', error)
  }
})

// para recibir el mes desde el proceso de renderizado
ipcMain.on('set-month-input-global', (event, monthInput) => {
  monthInputGlobal = monthInput;
  console.log('Mes recibido desde el proceso de renderizado:', monthInputGlobal);
});

// para recibir la fecha desde el proceso de renderizado
ipcMain.on('set-date-input-global', (event, dateInput) => {
  dateInputGlobal = dateInput;
 
});


// mostrar el diálogo de selección de directorio al recibir el evento 'select-directory'
ipcMain.on('select-directory', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Seleccione un directorio para guardar los PDFs',
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedDirectory = result.filePaths[0]
      if (students.length > 0 && lastNumber !== null) {
 
        generarPDF(students, lastNumber, selectedDirectory, dateInputGlobal, monthInputGlobal) // Llamamos a la función para generar los PDFs
      } else {
        console.error('Error: No se pueden generar los PDFs. Asegúrate de cargar los datos primero.')
      }
    }
  }).catch(err => {
    console.error('Error al mostrar el diálogo de selección de directorio:', err)
  })
})



// para generar el archivo Excel con la lista de facturas
function generarListaExcel(students, lastNumber, selectedDirectory, dateInputGlobal) {
  const workbook = new excel.Workbook()
  const worksheet = workbook.addWorksheet('Lista de Facturas')

  //  encabezados de las columnas
  worksheet.columns = [
    { header: 'NUMERO DE FACTURA', key: 'num_factura', width: 20 },
    { header: 'NOMBRE DEL ALUMNO', key: 'nombre_alumno', width: 30 },
    { header: 'FECHA', key: 'fecha', width: 15 },
    { header: 'IMPORTE NETO', key: 'importe_neto', width: 15 },
    { header: 'IMPORTE BRUTO', key: 'importe_bruto', width: 15 },
  ]

  // Agregar filas con los datos de cada alumno/factura
  students.forEach((student, index) => {
    const currentNumber = lastNumber + index
    const fecha = dateInputGlobal
    const row = worksheet.addRow({
      num_factura: `${currentNumber}`,
      nombre_alumno: student.ALUMNO,
      fecha: fecha,
      importe_neto: student['TOTAL A PAGAR'],
      importe_bruto: student['TOTAL A PAGAR'],
    })

    row.commit()
  })

  // Guardar el archivo Excel en el directorio seleccionado
  const excelFilePath = path.join(selectedDirectory, 'lista_facturas.xlsx')
  workbook.xlsx.writeFile(excelFilePath)
    .then(() => {
      console.log('Archivo Excel generado y guardado:', excelFilePath)
    })
    .catch((error) => {
      console.error('Error al generar el archivo Excel:', error)
    })
}


// Evento para generar la lista Excel al recibir el evento 'generate-excel-list'
ipcMain.on('generate-excel-list', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Seleccione un directorio para guardar la lista de facturas en Excel',
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedDirectory = result.filePaths[0]
      if (students.length > 0 && lastNumber !== null) {
        generarListaExcel(students, lastNumber, selectedDirectory, dateInputGlobal)
      } else {
        console.error('Error: No se pueden generar los datos para la lista Excel. Asegúrate de cargar los datos primero.')
      }
    }
  }).catch(err => {
    console.error('Error al mostrar el diálogo de selección de directorio:', err)
  })
})


