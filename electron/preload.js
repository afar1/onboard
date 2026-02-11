// preload.js — Secure bridge between Electron main process and the renderer.
// Exposes a clean API on window.onboard without giving the renderer
// direct access to Node.js or Electron internals.

const { contextBridge, ipcRenderer, webUtils } = require('electron');

// Track the current stream listener so we can swap it out
// between streaming commands (prevents listener accumulation).
let currentStreamCallback = null;

function streamRouter(_event, data) {
  if (currentStreamCallback) currentStreamCallback(data);
}

// Register exactly one listener on the channel. The callback
// is swapped via setStreamCallback below.
ipcRenderer.on('shell:streamOutput', streamRouter);

// Track file open callback (for double-click on .onboard files)
let fileOpenedCallback = null;
ipcRenderer.on('config:fileOpened', (_event, filePath) => {
  if (fileOpenedCallback) fileOpenedCallback(filePath);
});

contextBridge.exposeInMainWorld('onboard', {
  // Run a shell command and get back { stdout, stderr, exitCode, succeeded }.
  run: (command) => ipcRenderer.invoke('shell:run', command),

  // Open a URL in the default browser.
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  // Get the user's home directory.
  homedir: () => ipcRenderer.invoke('fs:homedir'),

  // Run a command with streaming output (for long installs).
  runStreaming: (command) => ipcRenderer.invoke('shell:runStreaming', command),

  // Set the callback that receives streaming output chunks.
  setStreamCallback: (callback) => {
    currentStreamCallback = callback;
  },

  // Clear the stream callback (call after streaming is done).
  clearStreamCallback: () => {
    currentStreamCallback = null;
  },

  // ─── Config Loading ────────────────────────────────────────────────

  // Load config from a local file path.
  loadConfigFile: (filePath) => ipcRenderer.invoke('config:loadFile', filePath),

  // Load config from a URL.
  loadConfigURL: (url) => ipcRenderer.invoke('config:loadURL', url),

  // Load the bundled default config.
  loadBundledConfig: () => ipcRenderer.invoke('config:loadBundled'),

  // Set callback for when a .onboard file is opened (double-click).
  onFileOpened: (callback) => {
    fileOpenedCallback = callback;
  },

  // Get the file path from a dropped file (needed with contextIsolation)
  getFilePath: (file) => webUtils.getPathForFile(file),
});
