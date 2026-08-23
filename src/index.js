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
    { path: '/', label: 'Dashboard', icon: 'fa-solid fa-chart-pie' },
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
    
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:30px; padding-bottom:20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="width:44px; height:44px; border-radius:50%; background:#5865F2; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px; color:#fff; box-shadow:0 0 12px rgba(88,101,242,0.4);">
        <i class="fa-brands fa-discord"></i>
      </div>
      <div>
        <div style="font-weight:700; font-size:16px; color:#fff;">nfyp_</div>
        <div style="font-size:12px; color:#64748b; font-weight:500; margin-top:2px;">Admin</div>
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
        padding: 20px 14px;
        text-align: center;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }
      .stat-box:hover {
        transform: translateY(-2px);
        border-color: rgba(56, 189, 248, 0.3);
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
        transition: 0.2s;
      }
      .btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .link-blue {
        color: #38bdf8;
        text-decoration: none;
        font-weight: 500;
        transition: 0.2s;
      }
      .link-blue:hover {
        text-decoration: underline;
        color: #7dd3fc;
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

// 1. Dashboard Route (Restored & Upgraded x100)
app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 2;
  const ping = client.ws?.ping || 20;

  const content = `
    <h2 style="margin-bottom: 4px; font-size: 24px;">Welcome, nfyp_</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 24px; font-size: 14px;">Here's what's happening with <strong style="color:#fff;">OS | System</strong> today.</p>

    <div class="grid-2">
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 10px;">Server Count</div>
        <div style="font-size: 22px; font-weight: bold; color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-chart-simple" style="color:#38bdf8; font-size:20px;"></i> ${guildCount}
        </div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 10px;">User Count</div>
        <div style="font-size: 22px; font-weight: bold; color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-users" style="color:#38bdf8; font-size:20px;"></i> ${userCount}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 10px;">API Latency</div>
        <div style="font-size: 22px; font-weight: bold; color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-bolt" style="color:#fcd34d; font-size:20px;"></i> ${ping}ms
        </div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 10px;">System Uptime</div>
        <div style="font-size: 20px; font-weight: bold; color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-stopwatch" style="color:#c084fc; font-size:18px;"></i> 0d 0h 1m 21s
        </div>
      </div>
    </div>
  `;
  res.send(layout('Dashboard', content, '/'));
});

// 2. Support Route (Interactive Blue Links)
app.get('/support', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 4px;">Support</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 24px;">Contact us using any of the following methods!</p>

    <div class="card" style="box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
      <h3 style="margin-top:0; font-size:16px; color:#fff; display:flex; align-items:center; gap:8px; margin-bottom:18px;">
        <i class="fa-solid fa-envelope" style="color:#38bdf8;"></i> Contact Details
      </h3>

      <div style="color:#cbd5e1; font-size:14px; line-height:2.2; margin-bottom:22px;">
        <div><strong>Email:</strong> <a href="mailto:mail@MohammedAlhajri-dev.com" class="link-blue">mail@MohammedAlhajri-dev.com</a></div>
        <div><strong>Twitter:</strong> <a href="https://x.com/i661y" target="_blank" class="link-blue">@i661y</a></div>
        <div><strong>Instagram:</strong> <a href="https://instagram.com/i661y" target="_blank" class="link-blue">@i661y</a></div>
        <div><strong>Discord Developer:</strong> <a href="https://discord.com/users" target="_blank" class="link-blue">Mohammed Alhajri</a></div>
      </div>

      <a href="https://discord.gg" target="_blank" class="btn">
        <i class="fa-brands fa-discord"></i> Join Discord Server
      </a>
    </div>
  `;
  res.send(layout('Support - OS | System', content, '/support'));
});

// 3. Guilds Route (Upgraded x100000)
app.get('/guilds', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 20px;">Guilds Overview</h2>
    
    <!-- Ultra Enhanced Server Card -->
    <div class="card" style="border: 1px solid rgba(56, 189, 248, 0.2); background: linear-gradient(145deg, #0d1730 0%, #080f20 100%);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:52px; height:52px; border-radius:14px; background:linear-gradient(135deg, #2563eb, #38bdf8); display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:22px; color:#fff; box-shadow:0 4px 15px rgba(37,99,235,0.4);">
            O
          </div>
          <div>
            <h3 style="margin:0; font-size:20px; color:#fff; font-weight:700;">OSCORP RP</h3>
            <div style="color:#64748b; font-size:12px; margin-top:3px; font-family:monospace;">ID: 1540577416353677415</div>
          </div>
        </div>
        <span style="background:rgba(52, 211, 153, 0.12); color:#34d399; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:600; border:1px solid rgba(52, 211, 153, 0.2); display:flex; align-items:center; gap:6px;">
          <span style="width:8px; height:8px; background:#34d399; border-radius:50%; display:inline-block;"></span> Connected
        </span>
      </div>

      <div class="grid-2">
        <div class="stat-box" style="background:rgba(6, 9, 19, 0.6);">
          <div style="font-size:13px; color:#94a3b8; margin-bottom:6px;">Total Roles</div>
          <div style="font-size:20px; font-weight:bold; color:#fff;"><i class="fa-solid fa-shield-halved" style="color:#38bdf8; margin-right:8px;"></i> 8 Roles</div>
        </div>
        <div class="stat-box" style="background:rgba(6, 9, 19, 0.6);">
          <div style="font-size:13px; color:#94a3b8; margin-bottom:6px;">Voice Channels</div>
          <div style="font-size:20px; font-weight:bold; color:#fff;"><i class="fa-solid fa-microphone-lines" style="color:#a855f7; margin-right:8px;"></i> 4 Channels</div>
        </div>
      </div>

      <!-- Created Duration Card -->
      <div style="background:rgba(6, 9, 19, 0.8); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:18px; margin-top:14px;">
        <div style="color:#fcd34d; font-size:12px; font-weight:700; letter-spacing:1.5px; margin-bottom:14px; text-transform:uppercase; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-clock"></i> Created Duration
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; text-align:center;">
          <div style="background:#0d1730; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:22px; font-weight:bold; color:#38bdf8;">15</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px; font-weight:700;">DAYS</div>
          </div>
          <div style="background:#0d1730; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:22px; font-weight:bold; color:#38bdf8;">2</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px; font-weight:700;">HOURS</div>
          </div>
          <div style="background:#0d1730; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:22px; font-weight:bold; color:#38bdf8;">1</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px; font-weight:700;">SECS</div>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:10px; margin-top:18px;">
        <button class="btn" style="flex:1; justify-content:center; background:#2563eb;"><i class="fa-solid fa-sliders"></i> Manage Guild</button>
        <button class="btn" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);"><i class="fa-solid fa-rotate"></i> Sync Data</button>
      </div>
    </div>
  `;
  res.send(layout('Guilds - OS | System', content, '/guilds'));
});

// 4. Plugins Route
app.get('/plugins', (req, res) => {
  res.redirect('/');
});

// 5. Settings Route
app.get('/settings', (req, res) => {
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
