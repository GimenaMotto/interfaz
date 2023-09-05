
// Habilitar el contexto de Node.js en la ventana de renderizado
const { contextBridge, ipcRenderer } = require('electron')

// Exponer ipcRenderer a través del contexto de puente seguro
contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

// Exponer una función para enviar el contenido JSON al proceso principal (main.js)
window.loadJSONData = (jsonContent) => {
  window.ipcRenderer.send('load-json-file', jsonContent)
}

