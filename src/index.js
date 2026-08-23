const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Discord Bot Setup
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
    console.log(`🤖 تم تسجيل الدخول بنجاح باسم البوت: ${client.user.tag}`);
  });

  client.login(BOT_TOKEN).catch(err => {
    console.error('❌ فشل تسجيل دخول البوت! تأكد من صحة التوكين:', err.message);
  });
} else {
  console.log('⚠️ DISCORD_TOKEN لم يتم العثور عليه في بيئة العمل');
}

// Navigation Bar Script
const sidebarScript = `
<script>
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar.style.transform === 'translateX(0px)') {
    sidebar.style.transform = 'translateX(-100%)';
    overlay.style.display = 'none';
  } else {
    sidebar.style.transform = 'translateX(0px)';
    overlay.style.display = 'block';
  }
}
</script>
`;

const sidebarHtml = `
<div id="overlay" onclick="toggleSidebar()" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:998;"></div>
<div id="sidebar" style="position:fixed; top:0; left:0; width:250px; height:100%; background:#0f172a; border-right:1px solid #1e293b; z-index:999; transform:translateX(-100%); transition:transform 0.3s ease; padding:20px; box-sizing:border-box; color:#f8fafc;">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
    <h3 style="margin:0; font-size:18px; color:#38bdf8;">📌 Dashboard</h3>
    <button onclick="toggleSidebar()" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">✕</button>
  </div>
  <nav style="display:flex; flex-direction:column; gap:12px;">
    <a href="/" style="color:#e2e8f0; text-decoration:none; padding:10px 14px; border-radius:8px; font-weight:500; display:flex; align-items:center; gap:10px; background:#1e293b;">📊 Dashboard</a>
    <a href="/guilds" style="color:#cbd5e1; text-decoration:none; padding:10px 14px; border-radius:8px; font-weight:500; display:flex; align-items:center; gap:10px;">🖥️ Servers (Guilds)</a>
    <a href="/plugins" style="color:#cbd5e1; text-decoration:none; padding:10px 14px; border-radius:8px; font-weight:500; display:flex; align-items:center; gap:10px;">🧩 Plugins</a>
    <a href="/settings" style="color:#cbd5e1; text-decoration:none; padding:10px 14px; border-radius:8px; font-weight:500; display:flex; align-items:center; gap:10px;">⚙️ Bot Settings</a>
    <a href="/support" style="color:#cbd5e1; text-decoration:none; padding:10px 14px; border-radius:8px; font-weight:500; display:flex; align-items:center; gap:10px;">🎧 Support</a>
  </nav>
</div>
`;

function layout(title, content) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #0b0f19;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      .top-banner {
        text-align: center;
        padding: 8px;
        background: linear-gradient(90deg, #0f172a, #1e1b4b, #0f172a);
        color: #fcd34d;
        font-size: 13px;
        font-weight: 500;
        border-bottom: 1px solid #1e293b;
      }
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 20px;
        background-color: #0f172a;
        border-bottom: 1px solid #1e293b;
      }
      .menu-btn {
        background: none;
        border: none;
        color: #f8fafc;
        font-size: 22px;
        cursor: pointer;
      }
      .user-profile {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #5865f2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
      .admin-tag {
        color: #94a3b8;
        font-size: 12px;
      }
      .container {
        padding: 20px;
      }
      .card {
        background-color: #111827;
        border: 1px solid #1f2937;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }
      .stat-box {
        background-color: #111827;
        border: 1px solid #1f2937;
        border-radius: 12px;
        padding: 16px;
        text-align: center;
      }
      .btn {
        background-color: #2563eb;
        color: white;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
      }
      .input-field {
        width: 100%;
        padding: 10px;
        background-color: #1f2937;
        border: 1px solid #374151;
        border-radius: 6px;
        color: white;
        margin-top: 6px;
        margin-bottom: 16px;
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
    <div class="top-banner">✨ سبحان الله وبحمده ، سبحان الله العظيم ✨</div>
    ${sidebarHtml}
    <div class="navbar">
      <button class="menu-btn" onclick="toggleSidebar()">☰</button>
      <div class="user-profile">
        <div class="user-avatar">👾</div>
        <span><b>nfyp_</b> <span class="admin-tag">Admin</span></span>
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

// 1. Root / Dashboard Page
app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 9;
  const ping = client.ws?.ping || 94;

  const content = `
    <h2 style="margin-bottom: 4px;">Welcome, nfyp_</h2>
    <p style="color: #9ca3af; margin-top: 0; margin-bottom: 20px;">Here's what's happening with <b>OS | System</b> today.</p>

    <div class="grid-2">
      <div class="stat-box">
        <div style="font-size: 13px; color: #9ca3af; margin-bottom: 6px;">Server Count</div>
        <div style="font-size: 18px; font-weight: bold;">📊 ${guildCount}</div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #9ca3af; margin-bottom: 6px;">User Count</div>
        <div style="font-size: 18px; font-weight: bold;">👥 ${userCount}</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom: 20px;">
      <div class="stat-box">
        <div style="font-size: 13px; color: #9ca3af; margin-bottom: 6px;">API Latency</div>
        <div style="font-size: 18px; font-weight: bold;">⚡ ${ping}ms</div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #9ca3af; margin-bottom: 6px;">System Uptime</div>
        <div style="font-size: 16px; font-weight: bold;">⏱️ 0d 0h 1m 21s</div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px; display: flex; align-items: center; gap: 8px;">
        📣 Dashboard Notice
      </h3>
      <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">
        Welcome to Discord BOT Dashboard V2, this is an early version of the final product! Please report any issues you find!
      </p>
      <div style="font-weight: bold; font-size: 13px;">Version: 3.5</div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px; display: flex; align-items: center; gap: 8px;">
        ℹ️ OS | System - Details
      </h3>
      <p style="margin: 6px 0; font-size: 14px;">• <b>Username:</b> OS | System#3523</p>
      <p style="margin: 6px 0; font-size: 14px;">• <b>Client ID:</b> 154057416353677415</p>
      <p style="margin: 6px 0; font-size: 14px;">• <b>Joined:</b> Saturday, August 22nd, 2026</p>
    </div>
  `;
  res.send(layout('Dashboard', content));
});

// 2. Plugins Page
app.get('/plugins', (req, res) => {
  const content = `
    <h2>Bot Plugins & Commands</h2>
    <div class="card">
      <h3>🧩 Active Plugins</h3>
      
      <div style="background:#1f2937; padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>🔨 Ban</strong>
          <div style="font-size:12px; color:#9ca3af;">Bans a user from the server.</div>
        </div>
        <span style="background-color:#059669; color:white; padding:4px 8px; border-radius:6px; font-size:12px;">Enabled</span>
      </div>

      <div style="background:#1f2937; padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>🗑️ Clear</strong>
          <div style="font-size:12px; color:#9ca3af;">Clears messages from a channel.</div>
        </div>
        <span style="background-color:#059669; color:white; padding:4px 8px; border-radius:6px; font-size:12px;">Enabled</span>
      </div>

      <div style="background:#1f2937; padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>🪙 Coin</strong>
          <div style="font-size:12px; color:#9ca3af;">Simple coin flip command</div>
        </div>
        <span style="background-color:#059669; color:white; padding:4px 8px; border-radius:6px; font-size:12px;">Enabled</span>
      </div>

      <div style="background:#1f2937; padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>🚪 Kick</strong>
          <div style="font-size:12px; color:#9ca3af;">Kicks a user from the server.</div>
        </div>
        <span style="background-color:#059669; color:white; padding:4px 8px; border-radius:6px; font-size:12px;">Enabled</span>
      </div>

      <div style="background:#1f2937; padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>⏲️ Ping</strong>
          <div style="font-size:12px; color:#9ca3af;">Ping / Pong!</div>
        </div>
        <span style="background-color:#059669; color:white; padding:4px 8px; border-radius:6px; font-size:12px;">Enabled</span>
      </div>
    </div>
  `;
  res.send(layout('Plugins - Dashboard', content));
});

// 3. Guilds Page
app.get('/guilds', (req, res) => {
  const content = `
    <h2>Connected Servers</h2>
    <div class="card">
      <h3>💳 Server List</h3>
      <div style="background:#1f2937; padding:14px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>🛡️ OSCORP RP</strong>
          <div style="font-size:12px; color:#9ca3af;">ID: 1540577416353677415 | Members: 9</div>
        </div>
        <span style="background-color:#059669; color:white; padding:4px 8px; border-radius:6px; font-size:12px;">Connected</span>
      </div>
    </div>
  `;
  res.send(layout('Guilds - Dashboard', content));
});

// 4. Settings Page
app.get('/settings', (req, res) => {
  const content = `
    <h2>Bot Settings</h2>
    <div class="card">
      <h3>⚙️ Configuration</h3>
      <form>
        <label style="font-size:14px; color:#9ca3af;">Bot Prefix</label>
        <input type="text" class="input-field" value="-">
        
        <label style="font-size:14px; color:#9ca3af;">Dashboard Port</label>
        <input type="text" class="input-field" value="1337" disabled>

        <button type="button" class="btn">💾 Save Settings</button>
      </form>
    </div>
  `;
  res.send(layout('Settings - Dashboard', content));
});

// 5. Support Page
app.get('/support', (req, res) => {
  const content = `
    <h2>Support & Help</h2>
    <div class="card">
      <h3>🎧 Need Help?</h3>
      <p style="color:#9ca3af;">If you encounter any issues or need custom configurations, feel free to contact developer Mohammed Alhajri.</p>
      <a href="https://discord.gg" target="_blank" class="btn" style="background-color: #5865f2;">👾 Join Support Discord</a>
    </div>
  `;
  res.send(layout('Support - Dashboard', content));
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
