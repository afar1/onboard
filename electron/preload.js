// preload.js — Secure bridge between Electron main process and the renderer.
// Exposes a clean API on window.onboard without giving the renderer
// direct access to Node.js or Electron internals.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('onboard', {
  // Run a shell command and get back { stdout, stderr, exitCode, succeeded }.
  run: (command) => ipcRenderer.invoke('shell:run', command),

  // Check if a specific tool is installed. Returns { installed, version, path }.
  checkTool: (toolId) => ipcRenderer.invoke('tool:check', toolId),

  // Open a URL in the default browser.
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  // Check if a directory exists.
  dirExists: (dirPath) => ipcRenderer.invoke('fs:dirExists', dirPath),

  // Create a directory recursively.
  mkdir: (dirPath) => ipcRenderer.invoke('fs:mkdir', dirPath),

  // Get the user's home directory.
  homedir: () => ipcRenderer.invoke('fs:homedir'),

  // Run a command with streaming output (for long installs).
  runStreaming: (command) => ipcRenderer.invoke('shell:runStreaming', command),

  // Listen for streaming output chunks during long-running commands.
  onStreamOutput: (callback) => {
    ipcRenderer.on('shell:streamOutput', (_event, data) => callback(data));
  },
});
