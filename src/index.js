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
      <div style="width:44px; height:44px; border-radius:50%; background:#5865F2; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px; color:#fff; box-shadow:0 0 12px rgba(88,101,242,0.4);">
        <i class="fa-brands fa-discord"></i>
      </div>
      <div>
        <div style="font-weight:700; font-size:16px; color:#fff;">nfyp_</div>
        <div style="font-size:12px; color:#64748b; font-weight:500; margin-top:2px;">Admin</div>
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
    <!-- FontAwesome 6 Icons -->
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
        padding: 10px;
        background: #090e1c;
        color: #fcd34d;
        font-size: 14px;
        font-weight: 600;
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
        background-color: #5865F2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: white;
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
        background-color: #5865F2;
        color: white;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      .btn-edit {
        background-color: #2563eb;
        color: white;
        border: none;
        padding: 7px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .btn-remove {
        background-color: #ef4444;
        color: white;
        border: none;
        padding: 7px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .code-badge {
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
        padding: 2px 8px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 13px;
      }
      /* Custom Toggle Switch */
      .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }
      .switch input {
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
        transform: translateX(20px);
      }
    </style>
  </head>
  <body>
    <div class="top-banner">✨ سبحان الله وبحمده ، سبحان الله العظيم ✨</div>
    ${getSidebarHtml(currentPath)}
    <div class="navbar">
      <button class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
      <div class="user-profile">
        <div class="user-avatar-mini"><i class="fa-brands fa-discord"></i></div>
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
  `;
  res.send(layout('Dashboard', content, '/'));
});

// 2. Plugins Route (Matching image 2)
app.get('/plugins', (req, res) => {
  const pluginsData = [
    {
      name: 'Ban',
      icon: 'fa-solid fa-hammer',
      iconBg: '#ef444420',
      iconColor: '#ef4444',
      developer: 'Mohammed Alhajri',
      description: 'Bans a user from the server.',
      usage: '-ban {@user}',
      aliases: 'خلخو',
      enabled: true
    },
    {
      name: 'clear',
      icon: 'fa-solid fa-trash-can',
      iconBg: '#0284c720',
      iconColor: '#38bdf8',
      developer: 'Mohammed Alhajri',
      description: 'Clears messages from a channel.',
      usage: '-clear {amount}',
      aliases: 'None',
      enabled: true
    },
    {
      name: 'coin',
      icon: 'fa-solid fa-coins',
      iconBg: '#eab30820',
      iconColor: '#eab308',
      developer: 'Mohammed Alhajri',
      description: 'Simple coin flip command',
      usage: '-coin',
      aliases: 'None',
      enabled: true
    },
    {
      name: 'kick',
      icon: 'fa-solid fa-user-minus',
      iconBg: '#f9731620',
      iconColor: '#f97316',
      developer: 'Mohammed Alhajri',
      description: 'Kicks a user from the server.',
      usage: '-kick {@user}',
      aliases: 'None',
      enabled: true
    }
  ];

  const pluginsHtml = pluginsData.map(p => `
    <div class="card" style="position:relative;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:${p.iconBg}; color:${p.iconColor}; display:flex; align-items:center; justify-content:center; font-size:18px;">
            <i class="${p.icon}"></i>
          </div>
          <h3 style="margin:0; font-size:18px; color:#fff;">${p.name}</h3>
        </div>
        <label class="switch">
          <input type="checkbox" ${p.enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <div style="color:#94a3b8; font-size:13px; line-height:1.8;">
        <div><strong>Developer:</strong> <span style="color:#cbd5e1;">${p.developer}</span></div>
        <div><strong>Description:</strong> <span style="color:#cbd5e1;">${p.description}</span></div>
        <div><strong>Usage:</strong> <span class="code-badge">${p.usage}</span></div>
        <div><strong>Aliases:</strong> <span style="color:#38bdf8;">${p.aliases}</span></div>
      </div>

      <div style="display:flex; gap:8px; margin-top:16px;">
        <button class="btn-edit"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
        <button class="btn-remove"><i class="fa-solid fa-trash"></i> Remove</button>
      </div>
    </div>
  `).join('');

  const content = `
    <h2 style="margin-bottom: 20px;">Plugins</h2>
    ${pluginsHtml}
  `;
  res.send(layout('Plugins - OS | System', content, '/plugins'));
});

// 3. Support Route (Matching image 1)
app.get('/support', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 4px;">Support</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 20px;">Contact us using any of the following methods!</p>

    <div class="card">
      <h3 style="margin-top:0; font-size:16px; color:#fff; display:flex; align-items:center; gap:8px; margin-bottom:16px;">
        <i class="fa-solid fa-envelope" style="color:#38bdf8;"></i> Contact Details
      </h3>

      <div style="color:#cbd5e1; font-size:14px; line-height:2.0; margin-bottom:20px;">
        <div><strong>Email:</strong> <span style="color:#94a3b8;">mail@MohammedAlhajri-dev.com</span></div>
        <div><strong>Twitter:</strong> <span style="color:#94a3b8;">@i661y</span></div>
        <div><strong>Instagram:</strong> <span style="color:#94a3b8;">@i661y</span></div>
        <div><strong>Discord Developer:</strong> <span style="color:#94a3b8;">Mohammed Alhajri</span></div>
      </div>

      <a href="https://discord.gg" target="_blank" class="btn" style="background:#5865F2;">
        <i class="fa-brands fa-discord"></i> Join Discord Server
      </a>
    </div>
  `;
  res.send(layout('Support - OS | System', content, '/support'));
});

// 4. Guilds Route
app.get('/guilds', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 20px;">Guilds - OS | System</h2>
    <div class="card">
      <h3 style="margin:0; font-size:20px; color:#fff;">OSCORP RP</h3>
      <div style="color:#64748b; font-size:13px; margin-top:2px;">ID: 1540577416353677415</div>
    </div>
  `;
  res.send(layout('Guilds - OS | System', content, '/guilds'));
});

// 5. Settings Route
app.get('/settings', (req, res) => {
  const content = `
    <h2>Settings</h2>
    <div class="card">
      <h3>System Configurations</h3>
    </div>
  `;
  res.send(layout('Settings - OS | System', content, '/settings'));
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
