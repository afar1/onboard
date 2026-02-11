// renderer.js — All the onboarding logic that runs in the browser window.
// Talks to the main process exclusively through window.onboard (the preload bridge).
// No Node.js access here — just DOM manipulation and IPC calls.

// ─── Tool Definitions ──────────────────────────────────────────────
// Each tool has an id, display name, description, why it matters,
// the check id (for the IPC handler), and install instructions.
// ORDER MATTERS — Homebrew first because everything else depends on it.

const TOOLS = [
  {
    id: 'homebrew',
    name: 'Homebrew',
    icon: '🍺',
    iconBg: 'var(--yellow-dim)',
    iconColor: 'var(--yellow)',
    desc: 'The package manager for macOS. Installs everything else.',
    explain: '<strong>Why:</strong> Homebrew is the standard way to install developer tools on macOS. Almost every other tool on this list can be installed through it. Think of it as the App Store for command-line tools.',
    installCmd: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
    installNote: 'This may take a few minutes and will ask for your password.',
  },
  {
    id: 'git',
    name: 'Git',
    icon: '🔀',
    iconBg: 'var(--red-dim)',
    iconColor: 'var(--red)',
    desc: 'Version control. Track changes, collaborate, push to GitHub.',
    explain: '<strong>Why:</strong> Git is how every developer tracks code changes and collaborates. When you "push" code to GitHub or "pull" someone else\'s project, you\'re using Git. It\'s non-negotiable.',
    installCmd: 'brew install git',
    dependsOn: 'homebrew',
  },
  {
    id: 'node',
    name: 'Node.js',
    icon: '🟢',
    iconBg: 'var(--green-dim)',
    iconColor: 'var(--green)',
    desc: 'JavaScript runtime. Runs JS outside the browser, powers npm.',
    explain: '<strong>Why:</strong> Node.js lets you run JavaScript on your machine (not just in a browser). It comes with npm, the package manager that installs libraries for web projects. Most modern web development depends on it.',
    installCmd: 'brew install node',
    dependsOn: 'homebrew',
  },
  {
    id: 'python',
    name: 'Python 3',
    icon: '🐍',
    iconBg: 'var(--blue-dim)',
    iconColor: 'var(--blue)',
    desc: 'General-purpose language. Used for scripting, AI/ML, and tooling.',
    explain: '<strong>Why:</strong> Python is everywhere — data science, automation, backend APIs, AI tools. Even if you\'re mainly doing web dev, you\'ll bump into Python scripts regularly. macOS ships with an old version; we need Python 3.',
    installCmd: 'brew install python@3',
    dependsOn: 'homebrew',
  },
  {
    id: 'bun',
    name: 'Bun',
    icon: '🥟',
    iconBg: 'var(--purple); opacity: 0.15',
    iconColor: 'var(--purple)',
    desc: 'Fast JavaScript runtime and package manager. Drop-in npm replacement.',
    explain: '<strong>Why:</strong> Bun is a modern, blazing-fast alternative to Node.js for running JavaScript and installing packages. Many newer projects use it for speed. It\'s optional but increasingly popular.',
    installCmd: 'brew install oven-sh/bun/bun',
    dependsOn: 'homebrew',
  },
  {
    id: 'claude',
    name: 'Claude CLI',
    icon: '🤖',
    iconBg: 'var(--blue-dim)',
    iconColor: 'var(--blue)',
    desc: 'AI coding assistant from Anthropic. Powers your pair programming.',
    explain: '<strong>Why:</strong> The Claude CLI gives you an AI coding partner right in your terminal. It can help write code, explain errors, refactor, and debug. It\'s the backbone of the AI-assisted development workflow.',
    installCmd: 'npm install -g @anthropic-ai/claude-code',
    dependsOn: 'node',
  },
];

// ─── State ─────────────────────────────────────────────────────────
// Simple state object tracking each tool's check result.

const toolStates = {};
TOOLS.forEach(t => {
  toolStates[t.id] = { status: 'unchecked', installed: false, version: null };
});

let homeDir = '';
let devFolderPath = '';
let clonedProjectPath = '';

// ─── Tab Switching ─────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active from all tabs and panels.
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    // Activate the clicked tab and its panel.
    btn.classList.add('active');
    const panelId = 'panel-' + btn.dataset.tab;
    document.getElementById(panelId).classList.add('active');
  });
});

// ─── Render Tool Cards ─────────────────────────────────────────────
// Build the DOM for each tool card on the Dependencies tab.

function renderToolCards() {
  const container = document.getElementById('tools-container');
  container.innerHTML = '';

  TOOLS.forEach(tool => {
    const state = toolStates[tool.id];
    const card = document.createElement('div');
    card.className = 'tool-card fade-in';
    card.id = `tool-${tool.id}`;

    card.innerHTML = `
      <div class="tool-card-header">
        <div class="tool-icon" style="background: ${tool.iconBg}; color: ${tool.iconColor};">${tool.icon}</div>
        <div class="tool-info">
          <div class="tool-name">
            ${tool.name}
            ${renderStatusBadge(state)}
          </div>
          <div class="tool-desc">${tool.desc}</div>
          ${state.version ? `<div class="version-text">${escapeHtml(state.version)}</div>` : ''}
        </div>
        <div class="tool-action">
          ${renderToolAction(tool, state)}
        </div>
      </div>
      <div class="tool-details" id="details-${tool.id}" style="display: none;">
        <div class="tool-explain">${tool.explain}</div>
        ${tool.installCmd ? `
          <div class="install-command">
            <code>${escapeHtml(tool.installCmd)}</code>
            <button class="copy-btn" onclick="copyToClipboard('${escapeJs(tool.installCmd)}', this)" title="Copy command">📋</button>
          </div>
        ` : ''}
        ${tool.installNote ? `<div class="tool-explain" style="margin-top: 8px; font-style: italic;">${tool.installNote}</div>` : ''}
        <div class="terminal-output" id="output-${tool.id}" style="display: none;"></div>
      </div>
    `;

    // Toggle details on header click.
    card.querySelector('.tool-card-header').addEventListener('click', (e) => {
      // Don't toggle if they clicked a button.
      if (e.target.closest('button')) return;
      const details = card.querySelector('.tool-details');
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    });

    container.appendChild(card);
  });
}

function renderStatusBadge(state) {
  if (state.status === 'checking') {
    return '<span class="status-badge checking"><span class="spinner"></span> Checking</span>';
  }
  if (state.status === 'installing') {
    return '<span class="status-badge checking"><span class="spinner"></span> Installing</span>';
  }
  if (state.installed) {
    return '<span class="status-badge installed">✓ Installed</span>';
  }
  if (state.status === 'checked') {
    return '<span class="status-badge missing">✗ Missing</span>';
  }
  return '';
}

function renderToolAction(tool, state) {
  if (state.status === 'checking' || state.status === 'installing') {
    return '<span class="spinner"></span>';
  }
  if (state.installed) {
    return '<span style="color: var(--green); font-size: 18px;">✓</span>';
  }
  if (state.status === 'checked' && !state.installed) {
    return `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); installTool('${tool.id}')">Install</button>`;
  }
  return '';
}

// ─── Check Dependencies ────────────────────────────────────────────

async function checkAllDependencies() {
  const btn = document.getElementById('check-all-btn');
  btn.disabled = true;
  btn.textContent = 'Checking...';
  setStatus('Checking installed tools...');

  for (const tool of TOOLS) {
    toolStates[tool.id].status = 'checking';
    renderToolCards();
    updateProgress();

    try {
      const result = await window.onboard.checkTool(tool.id);
      toolStates[tool.id] = {
        status: 'checked',
        installed: result.installed,
        version: result.version,
        path: result.path,
      };
    } catch (err) {
      toolStates[tool.id] = { status: 'checked', installed: false, version: null };
    }

    renderToolCards();
    updateProgress();
  }

  btn.disabled = false;
  btn.textContent = 'Re-check All';
  updateOverallStatus();
}

// ─── Install a Tool ────────────────────────────────────────────────
// Runs the install command for a given tool and shows output.

async function installTool(toolId) {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return;

  // Check dependency is installed first.
  if (tool.dependsOn && !toolStates[tool.dependsOn].installed) {
    const dep = TOOLS.find(t => t.id === tool.dependsOn);
    alert(`You need to install ${dep.name} first.`);
    return;
  }

  toolStates[toolId].status = 'installing';
  renderToolCards();

  // Show details and output.
  const details = document.getElementById(`details-${toolId}`);
  const output = document.getElementById(`output-${toolId}`);
  if (details) details.style.display = 'block';
  if (output) {
    output.style.display = 'block';
    output.innerHTML = `<span class="cmd">$ ${escapeHtml(tool.installCmd)}</span>\n`;
  }

  setStatus(`Installing ${tool.name}...`);

  try {
    // Listen for streaming output.
    const streamHandler = (data) => {
      if (output) {
        const cls = data.stream === 'stderr' ? 'err' : '';
        output.innerHTML += `<span class="${cls}">${escapeHtml(data.data)}</span>`;
        output.scrollTop = output.scrollHeight;
      }
    };
    window.onboard.onStreamOutput(streamHandler);

    const result = await window.onboard.runStreaming(tool.installCmd);

    if (result.succeeded) {
      // Re-check to confirm installation and get version.
      const check = await window.onboard.checkTool(toolId);
      toolStates[toolId] = {
        status: 'checked',
        installed: check.installed,
        version: check.version,
      };
      if (output) {
        output.innerHTML += `\n<span class="info">✓ ${tool.name} installed successfully.</span>`;
      }
    } else {
      toolStates[toolId].status = 'checked';
      if (output) {
        output.innerHTML += `\n<span class="err">✗ Installation failed (exit code ${result.exitCode}).</span>`;
        if (result.stderr) {
          output.innerHTML += `\n<span class="err">${escapeHtml(result.stderr)}</span>`;
        }
      }
    }
  } catch (err) {
    toolStates[toolId].status = 'checked';
    if (output) {
      output.innerHTML += `\n<span class="err">Error: ${escapeHtml(err.message)}</span>`;
    }
  }

  renderToolCards();
  updateProgress();
  updateOverallStatus();
}

// ─── Progress Tracking ─────────────────────────────────────────────

function updateProgress() {
  const total = TOOLS.length;
  const installed = TOOLS.filter(t => toolStates[t.id].installed).length;
  const pct = Math.round((installed / total) * 100);

  document.getElementById('deps-progress').style.width = pct + '%';
  document.getElementById('deps-progress-label').textContent = `${installed}/${total} installed`;

  // Update tab badge.
  const badge = document.getElementById('deps-badge');
  if (installed === total) {
    badge.className = 'tab-badge complete';
    badge.textContent = '✓';
  } else {
    badge.className = 'tab-badge pending';
    badge.textContent = `${installed}/${total}`;
  }
}

function updateOverallStatus() {
  const total = TOOLS.length;
  const installed = TOOLS.filter(t => toolStates[t.id].installed).length;
  const missing = total - installed;

  if (missing === 0) {
    setStatus('All dependencies installed. You\'re ready!');
  } else {
    setStatus(`${missing} tool${missing > 1 ? 's' : ''} still needed.`);
  }
}

function setStatus(text) {
  document.getElementById('status-text').textContent = text;
}

// ─── Accounts Tab Logic ────────────────────────────────────────────

async function installGhCli() {
  const output = document.getElementById('gh-output');
  output.style.display = 'block';
  output.innerHTML = '<span class="cmd">$ brew install gh</span>\n';

  const streamHandler = (data) => {
    output.innerHTML += escapeHtml(data.data);
    output.scrollTop = output.scrollHeight;
  };
  window.onboard.onStreamOutput(streamHandler);

  const result = await window.onboard.runStreaming('brew install gh');
  if (result.succeeded) {
    output.innerHTML += '\n<span class="info">✓ GitHub CLI installed.</span>';
    document.getElementById('gh-step-cli').classList.add('done');
    document.getElementById('gh-step-cli').textContent = '✓';
  } else {
    output.innerHTML += `\n<span class="err">✗ Failed. ${escapeHtml(result.stderr)}</span>`;
  }
}

async function ghAuthLogin() {
  const output = document.getElementById('gh-output');
  output.style.display = 'block';
  output.innerHTML += '\n<span class="cmd">$ gh auth login</span>\n';
  output.innerHTML += '<span class="info">Opening browser for GitHub authentication...</span>\n';

  // gh auth login with web flow.
  const result = await window.onboard.run('gh auth login --web --git-protocol https 2>&1 || true');
  output.innerHTML += escapeHtml(result.stdout || result.stderr) + '\n';

  // Check if auth worked.
  const check = await window.onboard.run('gh auth status 2>&1');
  if (check.succeeded) {
    output.innerHTML += '\n<span class="info">✓ Authenticated with GitHub!</span>';
    document.getElementById('gh-step-login').classList.add('done');
    document.getElementById('gh-step-login').textContent = '✓';
  }
}

function openLink(url) {
  window.onboard.openExternal(url);
}

// ─── Workspace Tab Logic ───────────────────────────────────────────

function suggestFolder(name) {
  document.getElementById('dev-folder-input').value = name;
}

function suggestRepo(url) {
  document.getElementById('clone-url-input').value = url;
}

async function createDevFolder() {
  const folderName = document.getElementById('dev-folder-input').value.trim();
  if (!folderName) return;

  const output = document.getElementById('folder-output');
  output.style.display = 'block';

  devFolderPath = `${homeDir}/${folderName}`;
  output.innerHTML = `<span class="cmd">$ mkdir -p ${escapeHtml(devFolderPath)}</span>\n`;

  const exists = await window.onboard.dirExists(devFolderPath);
  if (exists) {
    output.innerHTML += `<span class="info">✓ Folder already exists at ${escapeHtml(devFolderPath)}</span>`;
    document.getElementById('create-folder-btn').textContent = '✓ Exists';
    document.getElementById('clone-btn').disabled = false;
    return;
  }

  const result = await window.onboard.mkdir(devFolderPath);
  if (result.success) {
    output.innerHTML += `<span class="info">✓ Created ${escapeHtml(result.path)}</span>`;
    document.getElementById('create-folder-btn').textContent = '✓ Created';
    document.getElementById('clone-btn').disabled = false;
  } else {
    output.innerHTML += `<span class="err">✗ ${escapeHtml(result.error)}</span>`;
  }
}

async function cloneProject() {
  const url = document.getElementById('clone-url-input').value.trim();
  if (!url || !devFolderPath) return;

  const output = document.getElementById('clone-output');
  output.style.display = 'block';

  // Extract repo name from URL.
  const repoName = url.split('/').pop().replace('.git', '');
  clonedProjectPath = `${devFolderPath}/${repoName}`;

  const cmd = `cd "${devFolderPath}" && git clone --depth 1 ${url}`;
  output.innerHTML = `<span class="cmd">$ git clone ${escapeHtml(url)}</span>\n<span class="info">Cloning into ${escapeHtml(devFolderPath)}/${escapeHtml(repoName)}...</span>\n`;

  document.getElementById('clone-btn').disabled = true;
  document.getElementById('clone-btn').textContent = 'Cloning...';

  const streamHandler = (data) => {
    output.innerHTML += escapeHtml(data.data);
    output.scrollTop = output.scrollHeight;
  };
  window.onboard.onStreamOutput(streamHandler);

  const result = await window.onboard.runStreaming(cmd);

  if (result.succeeded) {
    output.innerHTML += `\n<span class="info">✓ Cloned to ${escapeHtml(clonedProjectPath)}</span>`;
    document.getElementById('clone-btn').textContent = '✓ Cloned';
    document.getElementById('run-btn').disabled = false;
  } else {
    output.innerHTML += `\n<span class="err">✗ Clone failed.</span>`;
    document.getElementById('clone-btn').disabled = false;
    document.getElementById('clone-btn').textContent = 'Retry';
  }
}

async function runProject() {
  if (!clonedProjectPath) return;

  const output = document.getElementById('run-output');
  output.style.display = 'block';

  document.getElementById('run-btn').disabled = true;
  document.getElementById('run-btn').textContent = 'Installing...';

  // First: npm install.
  output.innerHTML = `<span class="cmd">$ cd ${escapeHtml(clonedProjectPath)} && npm install</span>\n`;

  const streamHandler = (data) => {
    output.innerHTML += escapeHtml(data.data);
    output.scrollTop = output.scrollHeight;
  };
  window.onboard.onStreamOutput(streamHandler);

  const installResult = await window.onboard.runStreaming(`cd "${clonedProjectPath}" && npm install`);

  if (!installResult.succeeded) {
    output.innerHTML += `\n<span class="err">✗ npm install failed.</span>`;
    document.getElementById('run-btn').disabled = false;
    document.getElementById('run-btn').textContent = 'Retry';
    return;
  }

  output.innerHTML += `\n<span class="info">✓ Dependencies installed.</span>\n`;

  // Check for common start scripts.
  output.innerHTML += `\n<span class="cmd">$ npm run dev (or npm start)</span>\n`;
  output.innerHTML += `<span class="info">Starting project... Check your browser at http://localhost:3000</span>\n`;

  document.getElementById('run-btn').textContent = '✓ Running';

  // Run dev server (non-blocking — it'll keep running).
  window.onboard.run(`cd "${clonedProjectPath}" && (npm run dev || npm start) &`);

  // Show success.
  document.getElementById('workspace-success').style.display = 'block';
}

// ─── Helpers ───────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = original; }, 1500);
  } catch {
    // Fallback: just select the text.
  }
}

// ─── GitHub Auth Check ─────────────────────────────────────────────
// Run on startup to see if gh is already authed.

async function checkGitHubAuth() {
  const ghCheck = await window.onboard.run('gh auth status 2>&1');
  if (ghCheck.succeeded) {
    document.getElementById('gh-step-login').classList.add('done');
    document.getElementById('gh-step-login').textContent = '✓';
  }

  const ghInstalled = await window.onboard.checkTool('git');
  if (ghInstalled.installed) {
    document.getElementById('gh-step-account').classList.add('done');
    document.getElementById('gh-step-account').textContent = '✓';
  }

  // Check if gh CLI is installed.
  const ghCliCheck = await window.onboard.run('which gh');
  if (ghCliCheck.succeeded) {
    document.getElementById('gh-step-cli').classList.add('done');
    document.getElementById('gh-step-cli').textContent = '✓';
  }
}

// ─── Init ──────────────────────────────────────────────────────────
// Runs when the page loads. Renders cards, fetches home dir, checks tools.

async function init() {
  homeDir = await window.onboard.homedir();
  document.getElementById('dev-folder-input').placeholder = 'Dev';

  renderToolCards();
  setStatus('Ready. Click "Check All" to scan your machine.');

  // Auto-check dependencies on load.
  await checkAllDependencies();

  // Also check GitHub auth in the background.
  checkGitHubAuth();
}

init();
