const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const BOT_TOKEN = process.env.DISCORD_TOKEN;

if (BOT_TOKEN) {
  client.once('ready', () => {
    console.log(`🤖 Logged in as: ${client.user.tag}`);
  });
  client.login(BOT_TOKEN).catch(err => {
    console.error('❌ Login Error:', err.message);
  });
}

// Memory Store for Aliases
const pluginsStore = {
  ban: [],
  clear: [],
  coin: [],
  kick: []
};

const sidebarScript = `
<script>
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar.style.transform === 'translateX(0px)') {
    sidebar.style.transform = 'translateX(-100%)';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 300);
  } else {
    overlay.style.display = 'block';
    setTimeout(() => overlay.style.opacity = '1', 10);
    sidebar.style.transform = 'translateX(0px)';
  }
}
</script>
`;

function getSidebarHtml(activePath) {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-solid fa-chart-pie' },
    { path: '/plugins', label: 'Plugins', icon: 'fa-solid fa-rocket' },
    { path: '/guilds', label: 'Guilds', icon: 'fa-solid fa-server' },
    { path: '/support', label: 'Support', icon: 'fa-solid fa-circle-question' },
    { path: '/settings', label: 'Settings', icon: 'fa-solid fa-gear' }
  ];

  const navLinks = navItems.map(item => {
    const isActive = activePath === item.path;
    const activeStyle = isActive 
      ? 'background: linear-gradient(90deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.05)); color: #38bdf8; font-weight: 600; border-left: 3px solid #38bdf8;' 
      : 'color: #94a3b8;';
    return `
      <a href="${item.path}" style="text-decoration:none; padding:12px 16px; border-radius:8px; display:flex; align-items:center; gap:14px; font-size:15px; transition:0.2s; ${activeStyle}">
        <i class="${item.icon}" style="font-size:18px; width:22px; text-align:center;"></i>
        <span>${item.label}</span>
      </a>
    `;
  }).join('');

  return `
  <div id="overlay" onclick="toggleSidebar()" style="display:none; opacity:0; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index:998; transition: opacity 0.3s ease;"></div>
  <div id="sidebar" style="position:fixed; top:0; left:0; width:270px; height:100%; background:#090e1a; border-right:1px solid rgba(255, 255, 255, 0.08); z-index:999; transform:translateX(-100%); transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); padding:24px 18px; box-sizing:border-box; color:#f8fafc; box-shadow: 10px 0 30px rgba(0,0,0,0.8);">
    
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:30px; padding-bottom:20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #5865F2, #3b82f6); display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px; color:#fff; box-shadow:0 0 15px rgba(88,101,242,0.5);">
        <i class="fa-brands fa-discord"></i>
      </div>
      <div>
        <div style="font-weight:700; font-size:16px; color:#fff;">nfyp_</div>
        <div style="font-size:12px; color:#38bdf8; font-weight:600; margin-top:2px; display:flex; align-items:center; gap:4px;"><span style="width:6px; height:6px; background:#38bdf8; border-radius:50%;"></span> Admin</div>
      </div>
    </div>

    <nav style="display:flex; flex-direction:column; gap:6px;">
      ${navLinks}
    </nav>
  </div>
  `;
}

function layout(title, content, currentPath) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #080d1a;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        min-height: 100vh;
      }
      .top-banner {
        text-align: center;
        padding: 10px;
        background: linear-gradient(90deg, #090e1c, #0f172a, #090e1c);
        color: #fcd34d;
        font-size: 14px;
        font-weight: 600;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 22px;
        background-color: #0b1224;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .menu-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: #f8fafc;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        padding: 20px;
        max-width: 900px;
        margin: 0 auto;
      }
      .card {
        background: #0d1527;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 16px;
      }
      .btn {
        background: #2563eb;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
      }
      .btn-sky {
        background: #0284c7;
      }
      .btn-danger {
        background: #ef4444;
      }
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 46px;
        height: 24px;
      }
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #334155;
        transition: .3s;
        border-radius: 24px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #3b82f6;
      }
      input:checked + .slider:before {
        transform: translateX(22px);
      }
    </style>
  </head>
  <body>
    <div class="top-banner">✨ سبحان الله وبحمده ، سبحان الله العظيم ✨</div>
    ${getSidebarHtml(currentPath)}
    <div class="navbar">
      <button class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:34px; height:34px; border-radius:50%; background:#5865F2; display:flex; align-items:center; justify-content:center; font-size:16px; color:white;">
          <i class="fa-brands fa-discord"></i>
        </div>
        <span style="font-size:14px; font-weight:600;">nfyp_ <span style="color:#64748b; font-size:12px;">Admin</span></span>
      </div>
    </div>
    <div class="container">
      ${content}
    </div>
    ${sidebarScript}
  </body>
  </html>
  `;
}

// API endpoint to save aliases
app.post('/api/aliases', (req, res) => {
  const { pluginId, aliases } = req.body;
  if (pluginId && Array.isArray(aliases)) {
    pluginsStore[pluginId] = aliases.filter(a => a.trim() !== '');
    return res.json({ success: true });
  }
  res.status(400).json({ success: false });
});

// 1. Dashboard Page
app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 9;
  const ping = client.ws?.ping || 94;

  const content = `
    <div style="margin-bottom: 20px;">
      <h2 style="margin:0; font-size: 24px; font-weight:700;">Welcome, nfyp_</h2>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Here's what's happening with <strong style="color:#fff;">OS | System</strong> today.</p>
    </div>

    <div class="card" style="padding:16px; margin-bottom:16px;">
      <div style="margin-bottom:12px;">
        <button class="btn btn-sky" style="padding:6px 14px; font-size:13px;" onclick="location.reload();"><i class="fa-solid fa-rotate"></i> Refresh Data</button>
      </div>

      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:1px; background:rgba(255,255,255,0.08); border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
        
        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">Server Count (Guilds)</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-bars-staggered" style="font-size:16px; color:#94a3b8;"></i> ${guildCount}
          </div>
        </div>

        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">User Count (All Guilds)</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-users" style="font-size:16px; color:#94a3b8;"></i> ${userCount}
          </div>
        </div>

        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">API Latency</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-tower-broadcast" style="font-size:16px; color:#94a3b8;"></i> ${ping}ms
          </div>
        </div>

        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">Prefix</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-bullhorn" style="font-size:16px; color:#94a3b8;"></i> -
          </div>
        </div>

      </div>

      <div style="margin-top:16px; background:#0b1224; border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:14px;">
        <span style="background:rgba(52, 211, 153, 0.2); color:#34d399; font-size:11px; padding:3px 8px; border-radius:4px; font-weight:600;"><i class="fa-solid fa-circle" style="font-size:7px;"></i> Uptime</span>
        <div style="margin-top:10px; color:#cbd5e1; font-size:14px;"><i class="fa-solid fa-rotate" style="font-size:12px; color:#64748b;"></i> 0d 0h 2m 45s</div>
      </div>
    </div>

    <div style="margin-top:24px;">
      <h3 style="margin-bottom:6px; font-size:22px; font-weight:700;">Dashboard</h3>
      <p style="color:#94a3b8; font-size:13px; margin-top:0; margin-bottom:16px;">Find the latest news with Discord BOT Dashboard and information about "OS | System"</p>

      <div class="card">
        <h4 style="margin:0 0 12px 0; font-size:15px; color:#fff;"><i class="fa-solid fa-party-horn" style="color:#fcd34d;"></i> 🎉 Welcome</h4>
        <p style="color:#94a3b8; font-size:13px; line-height:1.5; margin:0 0 10px 0;">Welcome to Discord BOT Dashboard V2, this is an early version of the final product! Please report any issues you find!</p>
        <div style="font-size:12px; font-weight:bold; color:#cbd5e1;">Version: 3.0</div>
      </div>

      <div class="card">
        <h4 style="margin:0 0 14px 0; font-size:15px; color:#fff;"><i class="fa-solid fa-magnifying-glass" style="color:#38bdf8;"></i> 🔎 OS | System - Details</h4>
        <ul style="margin:0; padding-left:18px; color:#cbd5e1; font-size:13px; line-height:2;">
          <li><strong>Username:</strong> OS | System#3523</li>
          <li><strong>Client ID:</strong> 1540577416353677415</li>
          <li><strong>Joined:</strong> Saturday, August 22nd, 2026, 4:24 AM</li>
        </ul>
      </div>

      <div class="card">
        <h4 style="margin:0 0 10px 0; font-size:15px; color:#fff;"><i class="fa-solid fa-bullhorn" style="color:#38bdf8;"></i> 📢 News</h4>
        <p style="color:#94a3b8; font-size:13px; margin:0;">The Discord BOT Dashboard Marketplace is here, you can find plugins and modules easily!</p>
      </div>
    </div>
  `;
  res.send(layout('Dashboard - OS | System', content, '/'));
});

// 2. Plugins Page
app.get('/plugins', (req, res) => {
  const pluginsData = [
    {
      id: "ban",
      name: "Ban",
      icon: "fa-solid fa-hammer",
      iconBg: "rgba(239, 68, 68, 0.2)",
      iconColor: "#ef4444",
      iconBorder: "rgba(239, 68, 68, 0.4)",
      developer: "Mohammed Alhajri",
      description: "Bans a user from the server.",
      usage: "-ban {@user}",
      aliases: pluginsStore.ban,
      enabled: true
    },
    {
      id: "clear",
      name: "clear",
      icon: "fa-solid fa-trash-can",
      iconBg: "rgba(20, 184, 166, 0.2)",
      iconColor: "#14b8a6",
      iconBorder: "rgba(20, 184, 166, 0.4)",
      developer: "Mohammed Alhajri",
      description: "Clears messages from a channel.",
      usage: "-clear {amount}",
      aliases: pluginsStore.clear,
      enabled: true
    },
    {
      id: "coin",
      name: "coin",
      icon: "fa-solid fa-coins",
      iconBg: "rgba(245, 158, 11, 0.2)",
      iconColor: "#f59e0b",
      iconBorder: "rgba(245, 158, 11, 0.4)",
      developer: "Mohammed Alhajri",
      description: "Simple coin flip command",
      usage: "-coin",
      aliases: pluginsStore.coin,
      enabled: true
    },
    {
      id: "kick",
      name: "kick",
      icon: "fa-solid fa-user-minus",
      iconBg: "rgba(249, 115, 22, 0.2)",
      iconColor: "#f97316",
      iconBorder: "rgba(249, 115, 22, 0.4)",
      developer: "Mohammed Alhajri",
      description: "Kicks a user from the server.",
      usage: "-kick {@user}",
      aliases: pluginsStore.kick,
      enabled: true
    }
  ];

  const pluginCards = pluginsData.map(p => {
    const jsonAliases = JSON.stringify(p.aliases).replace(/"/g, '&quot;');
    const aliasesDisplay = p.aliases.length > 0 
      ? `<span style="color:#38bdf8; font-weight:600;">${p.aliases.join(', ')}</span>` 
      : `<span style="color:#94a3b8; font-weight:600;">None</span>`;

    return `
    <div class="card" style="padding:20px; margin-bottom:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:42px; height:42px; border-radius:10px; background:${p.iconBg}; border:1px solid ${p.iconBorder}; color:${p.iconColor}; display:flex; align-items:center; justify-content:center; font-size:18px;">
            <i class="${p.icon}"></i>
          </div>
          <h3 style="margin:0; font-size:20px; font-weight:700; color:#fff;">${p.name}</h3>
        </div>
        
        <label class="toggle-switch">
          <input type="checkbox" ${p.enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <div style="font-size:13px; color:#cbd5e1; line-height:1.8; margin-bottom:16px;">
        <div><strong>Developer:</strong> ${p.developer}</div>
        <div><strong>Description:</strong> ${p.description}</div>
        <div><strong>Usage:</strong> <span style="background:rgba(56, 189, 248, 0.12); color:#38bdf8; padding:2px 8px; border-radius:4px; font-family:monospace; font-size:12px;">${p.usage}</span></div>
        <div><strong>Aliases:</strong> ${aliasesDisplay}</div>
      </div>

      <div style="display:flex; gap:10px;">
        <button class="btn" onclick="openEditModal('${p.id}', '${p.name}', ${jsonAliases})" style="background:#2563eb; font-size:12px; padding:6px 14px;"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
        <button class="btn btn-danger" style="font-size:12px; padding:6px 14px;"><i class="fa-solid fa-trash"></i> Remove</button>
      </div>
    </div>
  `}).join('');

  const content = `
    <h2 style="margin-bottom: 18px; font-size:26px; font-weight:700;">Plugins</h2>
    <div>${pluginCards}</div>

    <!-- Edit Aliases Modal -->
    <div id="editAliasModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center; padding:15px; box-sizing:border-box;">
      <div class="card" style="width:100%; max-width:400px; margin:0; background:#0b1220; border:1px solid rgba(255,255,255,0.12); box-shadow:0 10px 30px rgba(0,0,0,0.8); border-radius:12px; padding:20px;">
        
        <h3 style="margin-top:0; color:#fff; font-size:17px; font-weight:700; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-pen-to-square" style="color:#38bdf8; font-size:16px;"></i> Edit Aliases
        </h3>
        
        <div style="color:#cbd5e1; font-size:13px; font-weight:600; margin-bottom:12px;">Aliases (up to 5)</div>

        <div id="aliasesContainer" style="display:flex; flex-direction:column; gap:10px; margin-bottom:12px;"></div>

        <div id="limitWarning" style="color:#ef4444; font-size:11px; font-weight:700; margin-bottom:12px; display:none; text-transform:uppercase;">
          YOU HAVE REACHED 5 LIMIT ONLY
        </div>

        <button id="addAliasBtn" onclick="addAliasField()" class="btn" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; width:100%; justify-content:center; margin-bottom:16px; font-size:13px; padding:8px;">
          <i class="fa-solid fa-plus"></i> Add Alias
        </button>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="closeEditModal()" class="btn" style="background:rgba(255,255,255,0.08); color:#cbd5e1; font-size:12px; padding:6px 16px;">Cancel</button>
          <button id="saveBtn" onclick="saveAliases()" class="btn" style="background:#22c55e; color:#fff; font-size:12px; padding:6px 16px;"><i class="fa-solid fa-floppy-disk"></i> Save</button>
        </div>

      </div>
    </div>

    <script>
      let currentPluginId = '';
      let currentAliases = [];

      function openEditModal(id, name, aliases) {
        currentPluginId = id;
        currentAliases = Array.isArray(aliases) ? [...aliases] : [];
        renderAliasInputs();
        document.getElementById('editAliasModal').style.display = 'flex';
      }

      function closeEditModal() {
        document.getElementById('editAliasModal').style.display = 'none';
      }

      function renderAliasInputs() {
        const container = document.getElementById('aliasesContainer');
        container.innerHTML = '';

        currentAliases.forEach((alias, index) => {
          const div = document.createElement('div');
          div.style.cssText = 'display:flex; align-items:center; gap:8px;';
          div.innerHTML = \`
            <input type="text" value="\${alias}" oninput="currentAliases[\${index}] = this.value" style="flex:1; background:#060a14; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 12px; border-radius:6px; font-size:13px; outline:none;">
            <button onclick="removeAliasField(\${index})" style="background:#ef4444; border:none; color:#fff; width:34px; height:34px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px;">
              <i class="fa-solid fa-trash"></i>
            </button>
          \`;
          container.appendChild(div);
        });

        const limitWarning = document.getElementById('limitWarning');
        const addBtn = document.getElementById('addAliasBtn');

        if (currentAliases.length >= 5) {
          limitWarning.style.display = 'block';
          addBtn.style.opacity = '0.5';
          addBtn.style.pointerEvents = 'none';
        } else {
          limitWarning.style.display = 'none';
          addBtn.style.opacity = '1';
          addBtn.style.pointerEvents = 'auto';
        }
      }

      function addAliasField() {
        if (currentAliases.length < 5) {
          currentAliases.push('');
          renderAliasInputs();
        }
      }

      function removeAliasField(index) {
        currentAliases.splice(index, 1);
        renderAliasInputs();
      }

      async function saveAliases() {
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
          const response = await fetch('/api/aliases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pluginId: currentPluginId,
              aliases: currentAliases
            })
          });

          if (response.ok) {
            location.reload();
          } else {
            alert('Failed to save aliases');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
          }
        } catch (err) {
          alert('Error connecting to server');
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
        }
      }
    </script>
  `;

  res.send(layout('Plugins - OS | System', content, '/plugins'));
});

// 3. Guilds Route
app.get('/guilds', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 20px; font-size:24px;">Guilds Overview</h2>
    
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:52px; height:52px; border-radius:14px; background:#2563eb; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:24px; color:#fff;">
            O
          </div>
          <div>
            <h3 style="margin:0; font-size:20px; color:#fff;">OSCORP RP</h3>
            <div style="color:#64748b; font-size:12px; margin-top:2px;">ID: 1540577416353677415</div>
          </div>
        </div>
        <span style="background:rgba(52, 211, 153, 0.15); color:#34d399; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600; border:1px solid rgba(52, 211, 153, 0.3);">
          ● Connected
        </span>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
        <div style="background:#0b1224; padding:14px; border-radius:10px;">
          <div style="font-size:12px; color:#94a3b8;">Text Channels</div>
          <div style="font-size:18px; font-weight:bold; color:#fff; margin-top:4px;"><i class="fa-solid fa-hashtag" style="color:#38bdf8;"></i> 6 Channels</div>
        </div>
        <div style="background:#0b1224; padding:14px; border-radius:10px;">
          <div style="font-size:12px; color:#94a3b8;">Voice Channels</div>
          <div style="font-size:18px; font-weight:bold; color:#fff; margin-top:4px;"><i class="fa-solid fa-microphone" style="color:#a855f7;"></i> 4 Channels</div>
        </div>
      </div>

      <div style="display:flex; gap:12px;">
        <button onclick="alert('Manage Guild')" class="btn" style="flex:1; justify-content:center;"><i class="fa-solid fa-sliders"></i> Manage Guild</button>
        <button onclick="alert('Guild Data Synchronized!')" class="btn" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);"><i class="fa-solid fa-rotate"></i> Sync Data</button>
      </div>
    </div>
  `;
  res.send(layout('Guilds - OS | System', content, '/guilds'));
});

// 4. Support Route
app.get('/support', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 4px;">Support</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 20px;">Contact us using any of the following methods!</p>

    <div class="card">
      <div style="color:#cbd5e1; font-size:14px; line-height:2.2; margin-bottom:20px;">
        <div><strong>Email:</strong> mail@MohammedAlhajri-dev.com</div>
        <div><strong>Developer:</strong> Mohammed Alhajri</div>
      </div>
      <a href="https://discord.gg" target="_blank" class="btn"><i class="fa-brands fa-discord"></i> Join Support Discord</a>
    </div>
  `;
  res.send(layout('Support - OS | System', content, '/support'));
});

// 5. Settings Route
app.get('/settings', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 6px; font-size:24px;">Global Settings</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 20px; font-size:14px;">Configure general system configurations for OS | System.</p>

    <div class="card">
      <h3 style="margin-top:0; font-size:16px; color:#fff;"><i class="fa-solid fa-sliders" style="color:#38bdf8;"></i> System Configuration</h3>
      <p style="color:#94a3b8; font-size:13px;">Manage global dashboard parameters.</p>
    </div>
  `;
  res.send(layout('Settings - OS | System', content, '/settings'));
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard live on port ${PORT}`);
});
