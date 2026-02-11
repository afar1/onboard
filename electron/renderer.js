// renderer.js — UI logic for the Onboard app.
// Loads configuration from .onboard YAML files and renders tools/apps.

// ─── State ─────────────────────────────────────────────────────────

let currentConfig = null;
let toolStates = {};   // { [id]: { status, installed } }
let appStates = {};    // { [id]: { status, installed } }
let homeDir = '';

// ─── Config Loading ────────────────────────────────────────────────

async function loadConfig(source) {
  if (!source) {
    showEmptyState();
    return false;
  }

  let result;

  try {
    if (source.startsWith('http://') || source.startsWith('https://')) {
      setStatus('Loading config from URL...');
      result = await window.onboard.loadConfigURL(source);
    } else if (source === 'bundled') {
      setStatus('Loading default config...');
      result = await window.onboard.loadBundledConfig();
    } else {
      setStatus('Loading config file...');
      result = await window.onboard.loadConfigFile(source);
    }
  } catch (err) {
    showError(`Failed to load config: ${err.message}`);
    return false;
  }

  // Handle errors from main process
  if (result && result.error) {
    showError(`Config error: ${result.error}`);
    return false;
  }

  // Reset state for new config
  currentConfig = result;
  toolStates = {};
  appStates = {};

  (currentConfig.dependencies || []).forEach(d => {
    toolStates[d.id] = { status: 'unchecked', installed: false };
  });
  (currentConfig.apps || []).forEach(a => {
    appStates[a.id] = { status: 'unchecked', installed: false };
  });

  // Save for persistence
  localStorage.setItem('lastConfigPath', source);

  // Update UI
  updateConfigDisplay();
  renderToolCards();
  renderAppCards();
  setStatus('Ready');

  // Auto-check all tools
  checkAllTools();

  return true;
}

function loadConfigFromURL() {
  const url = document.getElementById('config-url').value.trim();
  if (!url) {
    showError('Please enter a URL');
    return;
  }
  loadConfig(url);
}

function resetConfig() {
  localStorage.removeItem('lastConfigPath');
  currentConfig = null;
  toolStates = {};
  appStates = {};
  showEmptyState();
}

function updateConfigDisplay() {
  const name = currentConfig?.name || '';
  const desc = currentConfig?.description || '';

  document.getElementById('title-config-name').textContent = name;
  document.getElementById('config-name-display').textContent = name;
  document.getElementById('config-description').textContent = desc;
  document.title = name ? `onboard.computer — ${name}` : 'onboard.computer';

  // Show main content, hide empty state
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
}

function showEmptyState() {
  document.getElementById('empty-state').style.display = 'flex';
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('title-config-name').textContent = '';
  document.getElementById('config-url').value = '';
  document.title = 'onboard.computer';
  setStatus('Drop a config file to get started');
}

// ─── Rendering ─────────────────────────────────────────────────────

function renderIcon(item) {
  const bg = item.icon_bg || '#30363d';

  if (item.icon_img) {
    // Check if it's a URL or bundled filename
    const src = item.icon_img.startsWith('http') ? item.icon_img : `assets/${item.icon_img}`;
    return `<div class="tool-icon" style="background: ${bg}; padding: 4px;">
      <img src="${src}" alt="${item.name}" onerror="this.parentElement.innerHTML='${item.icon || '📦'}'">
    </div>`;
  }

  return `<div class="tool-icon" style="background: ${bg};">${item.icon || '📦'}</div>`;
}

function renderStatusBadge(state) {
  if (state.status === 'checking') {
    return '<span class="status-badge checking">Checking...</span>';
  }
  if (state.installed) {
    return '<span class="status-badge installed">✓ Installed</span>';
  }
  return '<span class="status-badge missing">Not installed</span>';
}

function renderAction(item, state, type) {
  if (state.status === 'checking') {
    return '<span class="spinner"></span>';
  }
  if (state.installed) {
    return '<span style="color: var(--green);">✓</span>';
  }

  const dependsOn = item.depends_on;
  if (dependsOn) {
    const depState = type === 'tool' ? toolStates[dependsOn] : appStates[dependsOn];
    if (depState && !depState.installed) {
      return `<button class="btn btn-sm" disabled>Needs ${dependsOn}</button>`;
    }
  }

  const onclick = type === 'tool'
    ? `installTool('${item.id}')`
    : `installApp('${item.id}')`;

  return `<button class="btn btn-primary btn-sm" onclick="${onclick}">Install</button>`;
}

function renderToolCards() {
  const container = document.getElementById('tools-container');
  const tools = currentConfig?.dependencies || [];
  container.innerHTML = '';

  tools.forEach(tool => {
    const state = toolStates[tool.id] || { status: 'unchecked', installed: false };
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.id = `tool-${tool.id}`;
    card.innerHTML = `
      ${renderIcon(tool)}
      <div class="tool-info">
        <div class="tool-name">${tool.name} ${renderStatusBadge(state)}</div>
        <div class="tool-desc">${tool.desc || ''}</div>
      </div>
      <div class="tool-action">${renderAction(tool, state, 'tool')}</div>
    `;
    container.appendChild(card);
  });

  updateDepsProgress();
}

function renderAppCards() {
  const container = document.getElementById('apps-container');
  const apps = currentConfig?.apps || [];
  container.innerHTML = '';

  apps.forEach(app => {
    const state = appStates[app.id] || { status: 'unchecked', installed: false };
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.id = `app-${app.id}`;
    card.innerHTML = `
      ${renderIcon(app)}
      <div class="tool-info">
        <div class="tool-name">${app.name} ${renderStatusBadge(state)}</div>
        <div class="tool-desc">${app.desc || ''}</div>
      </div>
      <div class="tool-action">${renderAction(app, state, 'app')}</div>
    `;
    container.appendChild(card);
  });

  updateAppsProgress();
}

function updateDepsProgress() {
  const tools = currentConfig?.dependencies || [];
  const installed = tools.filter(t => toolStates[t.id]?.installed).length;
  const label = document.getElementById('deps-progress-label');
  if (label) {
    label.textContent = `${installed}/${tools.length} installed`;
  }
}

function updateAppsProgress() {
  const apps = currentConfig?.apps || [];
  const installed = apps.filter(a => appStates[a.id]?.installed).length;
  const label = document.getElementById('apps-progress-label');
  if (label) {
    label.textContent = `${installed}/${apps.length} installed`;
  }
}

// ─── Tool Checking ─────────────────────────────────────────────────

async function checkTool(tool) {
  toolStates[tool.id] = { status: 'checking', installed: false };
  renderToolCards();

  const result = await window.onboard.run(tool.check);
  toolStates[tool.id] = {
    status: 'checked',
    installed: result.succeeded,
  };

  renderToolCards();
}

async function checkApp(app) {
  appStates[app.id] = { status: 'checking', installed: false };
  renderAppCards();

  const result = await window.onboard.run(app.check);
  appStates[app.id] = {
    status: 'checked',
    installed: result.succeeded,
  };

  renderAppCards();
}

async function checkAllTools() {
  setStatus('Checking tools...');

  // Check dependencies
  for (const tool of (currentConfig?.dependencies || [])) {
    await checkTool(tool);
  }

  // Check apps
  for (const app of (currentConfig?.apps || [])) {
    await checkApp(app);
  }

  setStatus('Ready');
}

// ─── Installation ──────────────────────────────────────────────────

async function installTool(toolId) {
  const tool = (currentConfig?.dependencies || []).find(t => t.id === toolId);
  if (!tool) return;

  setStatus(`Installing ${tool.name}...`);

  const result = await window.onboard.runStreaming(tool.install);

  if (result.succeeded) {
    // Re-check to confirm installation
    await checkTool(tool);
    setStatus(`${tool.name} installed`);
  } else {
    showError(`Failed to install ${tool.name}`);
    setStatus('Installation failed');
  }
}

async function installApp(appId) {
  const app = (currentConfig?.apps || []).find(a => a.id === appId);
  if (!app) return;

  setStatus(`Installing ${app.name}...`);

  const result = await window.onboard.runStreaming(app.install);

  if (result.succeeded) {
    // Re-check to confirm installation
    await checkApp(app);
    setStatus(`${app.name} installed`);
  } else {
    showError(`Failed to install ${app.name}`);
    setStatus('Installation failed');
  }
}

async function installAllDeps() {
  const tools = currentConfig?.dependencies || [];

  // Install in order — dependencies first
  for (const tool of tools) {
    if (toolStates[tool.id]?.installed) continue; // Already installed

    // Check dependency is installed (may have been installed earlier in this loop)
    if (tool.depends_on && !toolStates[tool.depends_on]?.installed) {
      continue; // Skip if dependency not met
    }

    await installTool(tool.id);
  }
}

async function installAllApps() {
  const apps = currentConfig?.apps || [];

  // Install in order
  for (const app of apps) {
    if (appStates[app.id]?.installed) continue; // Already installed

    // Check dependency (could be a tool or another app)
    if (app.depends_on) {
      const depInstalled = toolStates[app.depends_on]?.installed || appStates[app.depends_on]?.installed;
      if (!depInstalled) continue; // Skip if dependency not met
    }

    await installApp(app.id);
  }
}

// ─── Theme ─────────────────────────────────────────────────────────

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  document.getElementById('theme-dark').classList.toggle('active', theme === 'dark');
  document.getElementById('theme-light').classList.toggle('active', theme === 'light');
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  setTheme(saved);
}

// ─── UI Helpers ────────────────────────────────────────────────────

function setStatus(text) {
  const el = document.getElementById('status-text');
  if (el) el.textContent = text;
}

function showError(message) {
  const toast = document.getElementById('error-toast');
  const msgEl = document.getElementById('error-message');
  if (toast && msgEl) {
    msgEl.textContent = message;
    toast.style.display = 'flex';

    // Auto-hide after 5 seconds
    setTimeout(() => hideError(), 5000);
  }
}

function hideError() {
  const toast = document.getElementById('error-toast');
  if (toast) toast.style.display = 'none';
}

// ─── Drag and Drop ─────────────────────────────────────────────────

function initDragDrop() {
  const emptyState = document.getElementById('empty-state');

  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    emptyState.classList.add('drag-over');
  });

  document.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget || !document.body.contains(e.relatedTarget)) {
      emptyState.classList.remove('drag-over');
    }
  });

  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    emptyState.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.onboard')) {
      const filePath = window.onboard.getFilePath(file);
      await loadConfig(filePath);
    } else if (file) {
      showError('Please drop a .onboard file');
    }
  });

  // Handle file opened via double-click (macOS file association)
  window.onboard.onFileOpened(async (filePath) => {
    await loadConfig(filePath);
  });
}

// ─── Initialization ────────────────────────────────────────────────

async function init() {
  initTheme();
  initDragDrop();

  homeDir = await window.onboard.homedir();

  // Check if we have a saved config path
  const lastConfig = localStorage.getItem('lastConfigPath');
  if (lastConfig && lastConfig !== 'bundled' && lastConfig.length > 0) {
    const success = await loadConfig(lastConfig);
    if (!success) {
      // Show empty state if last config failed to load
      showEmptyState();
    }
  } else {
    // No saved config - show empty state
    showEmptyState();
  }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
