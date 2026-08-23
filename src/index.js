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

const sidebarHtml = `
<div id="overlay" onclick="toggleSidebar()" style="display:none; opacity:0; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index:998; transition: opacity 0.3s ease;"></div>
<div id="sidebar" style="position:fixed; top:0; left:0; width:280px; height:100%; background:linear-gradient(180deg, #090d16 0%, #0f172a 100%); border-right:1px solid rgba(56, 189, 248, 0.1); z-index:999; transform:translateX(-100%); transition:transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); padding:25px; box-sizing:border-box; color:#f8fafc; box-shadow: 10px 0 30px rgba(0,0,0,0.5);">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:35px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;">
    <h3 style="margin:0; font-size:20px; color:#38bdf8; display:flex; align-items:center; gap:10px;">⚡ OS Control</h3>
    <button onclick="toggleSidebar()" style="background:rgba(255,255,255,0.05); border:none; color:#94a3b8; width:32px; height:32px; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;">✕</button>
  </div>
  <nav style="display:flex; flex-direction:column; gap:10px;">
    <a href="/" style="color:#e2e8f0; text-decoration:none; padding:12px 16px; border-radius:10px; font-weight:500; display:flex; align-items:center; gap:12px; background:linear-gradient(90deg, rgba(56,189,248,0.15), transparent); border-left: 3px solid #38bdf8; transition:0.2s;">📊 Dashboard</a>
    <a href="/guilds" style="color:#94a3b8; text-decoration:none; padding:12px 16px; border-radius:10px; font-weight:500; display:flex; align-items:center; gap:12px; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)';this.style.color='#fff'" onmouseout="this.style.background='none';this.style.color='#94a3b8'">🖥️ Servers (Guilds)</a>
    <a href="/plugins" style="color:#94a3b8; text-decoration:none; padding:12px 16px; border-radius:10px; font-weight:500; display:flex; align-items:center; gap:12px; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)';this.style.color='#fff'" onmouseout="this.style.background='none';this.style.color='#94a3b8'">🧩 Plugins Matrix</a>
    <a href="/settings" style="color:#94a3b8; text-decoration:none; padding:12px 16px; border-radius:10px; font-weight:500; display:flex; align-items:center; gap:12px; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)';this.style.color='#fff'" onmouseout="this.style.background='none';this.style.color='#94a3b8'">⚙️ Bot Configuration</a>
    <a href="/support" style="color:#94a3b8; text-decoration:none; padding:12px 16px; border-radius:10px; font-weight:500; display:flex; align-items:center; gap:12px; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)';this.style.color='#fff'" onmouseout="this.style.background='none';this.style.color='#94a3b8'">🎧 Support Hub</a>
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
        background-color: #070a13;
        color: #f8fafc;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-image: radial-gradient(circle at 50% 0%, #111827 0%, #070a13 70%);
        min-height: 100vh;
      }
      .top-banner {
        text-align: center;
        padding: 10px;
        background: linear-gradient(90deg, rgba(15,23,42,0.8), rgba(30,27,75,0.8), rgba(15,23,42,0.8));
        color: #fcd34d;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.5px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background-color: rgba(11, 15, 25, 0.75);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        position: sticky;
        top: 0;
        z-index: 100;
      }
      .menu-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: #f8fafc;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.2s;
      }
      .menu-btn:hover {
        background: rgba(56, 189, 248, 0.15);
        border-color: rgba(56, 189, 248, 0.3);
      }
      .user-profile {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255,255,255,0.03);
        padding: 6px 14px 6px 6px;
        border-radius: 30px;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
      }
      .admin-tag {
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 25px 20px;
      }
      .card {
        background: rgba(17, 24, 39, 0.65);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 16px;
        padding: 22px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        transition: transform 0.2s ease, border-color 0.2s ease;
      }
      .card:hover {
        border-color: rgba(56, 189, 248, 0.2);
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;
      }
      .stat-box {
        background: rgba(17, 24, 39, 0.65);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        position: relative;
        overflow: hidden;
      }
      .stat-box::after {
        content: '';
        position: absolute;
        top: 0; left: 0; width: 100%; height: 2px;
        background: linear-gradient(90deg, transparent, #38bdf8, transparent);
        opacity: 0.5;
      }
      .btn {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: white;
        border: none;
        padding: 12px 22px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
        transition: 0.2s;
      }
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
      }
      .input-field {
        width: 100%;
        padding: 12px 16px;
        background: rgba(11, 15, 25, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: white;
        margin-top: 8px;
        margin-bottom: 20px;
        box-sizing: border-box;
        font-size: 14px;
        outline: none;
        transition: 0.2s;
      }
      .input-field:focus {
        border-color: #38bdf8;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
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
        <div style="display:flex; flex-direction:column; gap:2px;">
          <span style="font-size:13px; font-weight:bold; line-height:1;">nfyp_</span>
          <span class="admin-tag">Admin</span>
        </div>
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

// 1. Root / Dashboard Page (x1000 Upgraded)
app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 9;
  const ping = client.ws?.ping || 94;

  const content = `
    <div style="margin-bottom: 25px;">
      <h2 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 800; background: linear-gradient(90deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome back, nfyp_ 👋</h2>
      <p style="color: #94a3b8; margin: 0; font-size: 15px;">Here is the real-time telemetry and overview for <b>OS | System</b>.</p>
    </div>

    <div class="grid-2">
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px; font-weight: 500;">Server Count</div>
        <div style="font-size: 22px; font-weight: 800; color: #38bdf8;">📊 ${guildCount}</div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px; font-weight: 500;">User Count</div>
        <div style="font-size: 22px; font-weight: 800; color: #34d399;">👥 ${userCount}</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom: 25px;">
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px; font-weight: 500;">API Latency</div>
        <div style="font-size: 22px; font-weight: 800; color: #fcd34d;">⚡ ${ping}ms</div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px; font-weight: 500;">System Uptime</div>
        <div style="font-size: 18px; font-weight: 800; color: #c084fc;">⏱️ 0d 0h 2m 14s</div>
      </div>
    </div>

    <div class="card" style="border-left: 4px solid #38bdf8;">
      <h3 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 17px; display: flex; align-items: center; gap: 8px;">
        📣 Dashboard Notice
      </h3>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
        Welcome to Discord BOT Dashboard V2 (x1000 Pro Edition). High-performance matrix operating smoothly. Report any anomalies instantly!
      </p>
      <div style="display:inline-block; background:rgba(56,189,248,0.1); color:#38bdf8; padding:4px 10px; border-radius:6px; font-weight: bold; font-size: 12px;">Version: 3.5 Pro</div>
    </div>

    <div class="card" style="border-left: 4px solid #6366f1;">
      <h3 style="margin: 0 0 12px 0; color: #818cf8; font-size: 17px; display: flex; align-items: center; gap: 8px;">
        ℹ️ OS | System - Secure Core Details
      </h3>
      <p style="margin: 6px 0; font-size: 14px; color:#cbd5e1;">• <b>Username:</b> OS | System#3523</p>
      <p style="margin: 6px 0; font-size: 14px; color:#cbd5e1;">• <b>Client ID:</b> 154057416353677415</p>
      <p style="margin: 6px 0; font-size: 14px; color:#cbd5e1;">• <b>Joined:</b> Saturday, August 22nd, 2026</p>
    </div>
  `;
  res.send(layout('Dashboard Pro', content));
});

// 2. Plugins Page
app.get('/plugins', (req, res) => {
  const content = `
    <h2 style="margin-top:0;">Bot Plugins Matrix</h2>
    <div class="card">
      <h3 style="margin-top:0; color:#38bdf8;">🧩 Active Core Modules</h3>
      
      <div style="background:rgba(255,255,255,0.03); padding:14px; border-radius:12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.05);">
        <div>
          <strong style="font-size:15px;">🔨 Ban Module</strong>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Bans disruptive users from the server matrix.</div>
        </div>
        <span style="background-color:rgba(5,150,105,0.2); color:#34d399; border:1px solid rgba(5,150,105,0.4); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">Active</span>
      </div>

      <div style="background:rgba(255,255,255,0.03); padding:14px; border-radius:12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.05);">
        <div>
          <strong style="font-size:15px;">🗑️ Clear Purge</strong>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Clears specific message volumes from channels.</div>
        </div>
        <span style="background-color:rgba(5,150,105,0.2); color:#34d399; border:1px solid rgba(5,150,105,0.4); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">Active</span>
      </div>

      <div style="background:rgba(255,255,255,0.03); padding:14px; border-radius:12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.05);">
        <div>
          <strong style="font-size:15px;">🪙 Coin Flip</strong>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Advanced probability randomizer command.</div>
        </div>
        <span style="background-color:rgba(5,150,105,0.2); color:#34d399; border:1px solid rgba(5,150,105,0.4); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">Active</span>
      </div>

      <div style="background:rgba(255,255,255,0.03); padding:14px; border-radius:12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.05);">
        <div>
          <strong style="font-size:15px;">🚪 Kick Protocol</strong>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Ejects selected users safely.</div>
        </div>
        <span style="background-color:rgba(5,150,105,0.2); color:#34d399; border:1px solid rgba(5,150,105,0.4); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">Active</span>
      </div>

      <div style="background:rgba(255,255,255,0.03); padding:14px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.05);">
        <div>
          <strong style="font-size:15px;">⏲️ Ping Diagnostics</strong>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Measures round-trip responsiveness.</div>
        </div>
        <span style="background-color:rgba(5,150,105,0.2); color:#34d399; border:1px solid rgba(5,150,105,0.4); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">Active</span>
      </div>
    </div>
  `;
  res.send(layout('Plugins Matrix', content));
});

// 3. Guilds Page
app.get('/guilds', (req, res) => {
  const content = `
    <h2 style="margin-top:0;">Connected Servers</h2>
    <div class="card">
      <h3 style="margin-top:0; color:#38bdf8;">💳 Authorized Nodes</h3>
      <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.05);">
        <div>
          <strong style="font-size:16px;">🛡️ OSCORP RP</strong>
          <div style="font-size:12px; color:#94a3b8; margin-top:4px;">ID: 1540577416353677415 | Active Members: 9</div>
        </div>
        <span style="background-color:rgba(5,150,105,0.2); color:#34d399; border:1px solid rgba(5,150,105,0.4); padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600;">Connected</span>
      </div>
    </div>
  `;
  res.send(layout('Servers Hub', content));
});

// 4. Settings Page
app.get('/settings', (req, res) => {
  const content = `
    <h2 style="margin-top:0;">Bot Configuration</h2>
    <div class="card">
      <h3 style="margin-top:0; color:#38bdf8;">⚙️ System Parameters</h3>
      <form>
        <label style="font-size:14px; color:#94a3b8; font-weight:500;">Bot Command Prefix</label>
        <input type="text" class="input-field" value="-">
        
        <label style="font-size:14px; color:#94a3b8; font-weight:500;">Dashboard Port Bind</label>
        <input type="text" class="input-field" value="10000" disabled style="opacity: 0.7;">

        <button type="button" class="btn">💾 Save Configuration</button>
      </form>
    </div>
  `;
  res.send(layout('Settings Center', content));
});

// 5. Support Page
app.get('/support', (req, res) => {
  const content = `
    <h2 style="margin-top:0;">Support & Assistance</h2>
    <div class="card">
      <h3 style="margin-top:0; color:#38bdf8;">🎧 Developer Helpdesk</h3>
      <p style="color:#94a3b8; line-height:1.6; margin-bottom:20px;">If you encounter any anomalies or require custom architectural upgrades, reach out to developer Mohammed Alhajri.</p>
      <a href="https://discord.gg" target="_blank" class="btn" style="background: linear-gradient(135deg, #5865f2, #4752c4); box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);">👾 Join Support Discord</a>
    </div>
  `;
  res.send(layout('Support Hub', content));
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
