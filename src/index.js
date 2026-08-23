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

// Sidebar JavaScript toggle
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

// Sidebar Component
function getSidebarHtml(activePath) {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-solid fa-house' },
    { path: '/plugins', label: 'Plugins', icon: 'fa-solid fa-rocket' },
    { path: '/guilds', label: 'Guilds', icon: 'fa-solid fa-server' },
    { path: '/support', label: 'Support', icon: 'fa-solid fa-circle-question' },
    { path: '/settings', label: 'Settings', icon: 'fa-solid fa-gear' }
  ];

  const navLinks = navItems.map(item => {
    const isActive = activePath === item.path;
    const activeStyle = isActive 
      ? 'background: rgba(56, 189, 248, 0.12); color: #38bdf8; font-weight: 600;' 
      : 'color: #94a3b8;';
    return `
      <a href="${item.path}" style="text-decoration:none; padding:12px 16px; border-radius:10px; display:flex; align-items:center; gap:14px; font-size:15px; transition:0.2s; ${activeStyle}">
        <i class="${item.icon}" style="font-size:18px; width:22px; text-align:center;"></i>
        <span>${item.label}</span>
      </a>
    `;
  }).join('');

  return `
  <div id="overlay" onclick="toggleSidebar()" style="display:none; opacity:0; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index:998; transition: opacity 0.3s ease;"></div>
  <div id="sidebar" style="position:fixed; top:0; left:0; width:270px; height:100%; background:#0b1329; border-right:1px solid rgba(255, 255, 255, 0.05); z-index:999; transform:translateX(-100%); transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); padding:24px 18px; box-sizing:border-box; color:#f8fafc; box-shadow: 10px 0 30px rgba(0,0,0,0.5);">
    
    <!-- Profile Header in Sidebar -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:30px; padding-bottom:20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="width:44px; height:44px; border-radius:50%; background:#2563eb; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px; color:#fff; box-shadow:0 0 12px rgba(37,99,235,0.4);">
        N
      </div>
      <div>
        <div style="font-weight:700; font-size:16px; color:#fff;">nfyp_</div>
        <div style="font-size:12px; color:#38bdf8; font-weight:500; margin-top:2px;">Administrator</div>
      </div>
    </div>

    <!-- Navigation List -->
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
    <!-- FontAwesome 6 Icons x100 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #060913;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        min-height: 100vh;
      }
      .top-banner {
        text-align: center;
        padding: 8px;
        background: rgba(15, 23, 42, 0.9);
        color: #fcd34d;
        font-size: 13px;
        font-weight: 500;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 20px;
        background-color: #0b1329;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .menu-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        color: #f8fafc;
        width: 38px;
        height: 38px;
        border-radius: 8px;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .user-profile {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .user-avatar-mini {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
      }
      .container {
        padding: 20px;
        max-width: 850px;
        margin: 0 auto;
      }
      .card {
        background-color: #0d1730;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }
      .stat-box {
        background-color: #0d1730;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 18px;
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
        padding: 10px 14px;
        background-color: #060913;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: white;
        margin-top: 6px;
        margin-bottom: 16px;
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
    <div class="top-banner">✨ سبحان الله وبحمده ، سبحان الله العظيم ✨</div>
    ${getSidebarHtml(currentPath)}
    <div class="navbar">
      <button class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
      <div class="user-profile">
        <div class="user-avatar-mini">N</div>
        <span style="font-size:14px;"><b>nfyp_</b> <span style="color:#64748b; font-size:12px;">Admin</span></span>
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

// 1. Dashboard Route
app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 9;
  const ping = client.ws?.ping || 94;

  const content = `
    <h2 style="margin-bottom: 4px;">Welcome, nfyp_</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 20px;">Here's what's happening with <b>OS | System</b> today.</p>

    <div class="grid-2">
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">Server Count</div>
        <div style="font-size: 20px; font-weight: bold;"><i class="fa-solid fa-chart-simple" style="color:#38bdf8; margin-right:6px;"></i> ${guildCount}</div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">User Count</div>
        <div style="font-size: 20px; font-weight: bold;"><i class="fa-solid fa-users" style="color:#38bdf8; margin-right:6px;"></i> ${userCount}</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom: 20px;">
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">API Latency</div>
        <div style="font-size: 20px; font-weight: bold;"><i class="fa-solid fa-bolt" style="color:#fcd34d; margin-right:6px;"></i> ${ping}ms</div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">System Uptime</div>
        <div style="font-size: 18px; font-weight: bold;"><i class="fa-solid fa-stopwatch" style="color:#c084fc; margin-right:6px;"></i> 0d 0h 1m 21s</div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px;">
        <i class="fa-solid fa-bullhorn" style="margin-right: 8px;"></i> Dashboard Notice
      </h3>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">
        Welcome to Discord BOT Dashboard V2, this is an early version of the final product! Please report any issues you find!
      </p>
      <div style="font-weight: bold; font-size: 13px;">Version: 3.5</div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px;">
        <i class="fa-solid fa-circle-info" style="margin-right: 8px;"></i> OS | System - Details
      </h3>
      <p style="margin: 8px 0; font-size: 14px;">• <b>Username:</b> OS | System#3523</p>
      <p style="margin: 8px 0; font-size: 14px;">• <b>Client ID:</b> 154057416353677415</p>
      <p style="margin: 8px 0; font-size: 14px;">• <b>Joined:</b> Saturday, August 22nd, 2026</p>
    </div>
  `;
  res.send(layout('Dashboard', content, '/'));
});

// 2. Guilds Route (Matching the exact second image details)
app.get('/guilds', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 20px;">Guilds - OS | System</h2>
    
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h3 style="margin:0; font-size:20px; color:#fff;">OSCORP RP</h3>
          <div style="color:#64748b; font-size:13px; margin-top:2px;">ID: 1540577416353677415</div>
        </div>
        <span style="background:rgba(5, 150, 105, 0.2); color:#34d399; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">Connected</span>
      </div>

      <div class="grid-2">
        <div class="stat-box">
          <div style="font-size:13px; color:#94a3b8; margin-bottom:6px;">Total Roles</div>
          <div style="font-size:18px; font-weight:bold;"><i class="fa-solid fa-shield-halved" style="color:#64748b; margin-right:6px;"></i> 8</div>
        </div>
        <div class="stat-box">
          <div style="font-size:13px; color:#94a3b8; margin-bottom:6px;">Voice Channels</div>
          <div style="font-size:18px; font-weight:bold;"><i class="fa-solid fa-bullhorn" style="color:#64748b; margin-right:6px;"></i> 4</div>
        </div>
      </div>

      <!-- Created Duration Card -->
      <div style="background:#091024; border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:16px; margin-top:10px;">
        <div style="color:#fcd34d; font-size:12px; font-weight:700; letter-spacing:1px; margin-bottom:12px; text-transform:uppercase;">Created Duration</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; text-align:center;">
          <div style="background:#0d1730; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:18px; font-weight:bold;">15</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">DAYS</div>
          </div>
          <div style="background:#0d1730; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:18px; font-weight:bold;">2</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">HOURS</div>
          </div>
          <div style="background:#0d1730; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:18px; font-weight:bold;">1</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">SECS</div>
          </div>
        </div>
      </div>
    </div>
  `;
  res.send(layout('Guilds - Dashboard', content, '/guilds'));
});

// 3. Plugins Route
app.get('/plugins', (req, res) => {
  const content = `
    <h2>Plugins Matrix</h2>
    <div class="card">
      <h3 style="margin-top:0;">🧩 Enabled Commands</h3>
      <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
        <div style="background:#060913; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <div><i class="fa-solid fa-gavel" style="margin-right:8px; color:#38bdf8;"></i> <strong>Ban</strong></div>
          <span style="color:#34d399; font-size:12px;"><i class="fa-solid fa-circle-check"></i> Active</span>
        </div>
        <div style="background:#060913; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <div><i class="fa-solid fa-trash" style="margin-right:8px; color:#38bdf8;"></i> <strong>Clear</strong></div>
          <span style="color:#34d399; font-size:12px;"><i class="fa-solid fa-circle-check"></i> Active</span>
        </div>
        <div style="background:#060913; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <div><i class="fa-solid fa-coins" style="margin-right:8px; color:#38bdf8;"></i> <strong>Coin</strong></div>
          <span style="color:#34d399; font-size:12px;"><i class="fa-solid fa-circle-check"></i> Active</span>
        </div>
      </div>
    </div>
  `;
  res.send(layout('Plugins - Dashboard', content, '/plugins'));
});

// 4. Support Route
app.get('/support', (req, res) => {
  const content = `
    <h2>Support Hub</h2>
    <div class="card">
      <h3><i class="fa-solid fa-headset"></i> Need Assistance?</h3>
      <p style="color:#94a3b8; line-height:1.6;">Reach out for custom configurations or system updates.</p>
      <a href="https://discord.gg" target="_blank" class="btn"><i class="fa-brands fa-discord" style="margin-right:6px;"></i> Join Discord Server</a>
    </div>
  `;
  res.send(layout('Support - Dashboard', content, '/support'));
});

// 5. Settings Route
app.get('/settings', (req, res) => {
  const content = `
    <h2>Bot Settings</h2>
    <div class="card">
      <h3><i class="fa-solid fa-sliders"></i> Configuration</h3>
      <form>
        <label style="font-size:14px; color:#94a3b8;">Bot Prefix</label>
        <input type="text" class="input-field" value="-">
        <button type="button" class="btn">Save Changes</button>
      </form>
    </div>
  `;
  res.send(layout('Settings - Dashboard', content, '/settings'));
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
