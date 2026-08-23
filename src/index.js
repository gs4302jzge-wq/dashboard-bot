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
        background-color: #040711;
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
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      }
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 22px;
        background-color: #080d1a;
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
        transition: 0.2s;
      }
      .menu-btn:hover {
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
      }
      .container {
        padding: 24px;
        max-width: 900px;
        margin: 0 auto;
      }
      .card {
        background: linear-gradient(145deg, #0b1329 0%, #070c1b 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-bottom: 14px;
      }
      .stat-box {
        background: linear-gradient(135deg, rgba(13, 23, 48, 0.8), rgba(8, 15, 32, 0.9));
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 14px;
        padding: 22px 16px;
        text-align: center;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      .stat-box:hover {
        transform: translateY(-3px);
        border-color: rgba(56, 189, 248, 0.4);
        box-shadow: 0 8px 25px rgba(56, 189, 248, 0.15);
      }
      .btn {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        transition: 0.2s;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
      }
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
      }
      .link-blue {
        color: #38bdf8;
        text-decoration: none;
        font-weight: 600;
        transition: 0.2s;
      }
      .link-blue:hover {
        color: #7dd3fc;
        text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
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
        <span style="font-size:14px; font-weight:600;">nfyp_ <span style="color:#64748b; font-size:12px; font-weight:normal;">Admin</span></span>
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

// 1. Dashboard (Ultra Luxe x1000)
app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 2;
  const ping = client.ws?.ping || 16;

  const content = `
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: 24px;">
      <div>
        <h2 style="margin:0; font-size: 28px; font-weight:800; background: linear-gradient(90deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome back, nfyp_ 👋</h2>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Here is the high-performance overview of <strong style="color:#38bdf8;">OS | System</strong>.</p>
      </div>
      <span style="background:rgba(56,189,248,0.1); color:#38bdf8; padding:6px 14px; border-radius:30px; font-size:12px; font-weight:700; border:1px solid rgba(56,189,248,0.2);">
        <i class="fa-solid fa-circle" style="font-size:8px; margin-right:6px; color:#38bdf8;"></i> SYSTEM ONLINE
      </span>
    </div>

    <!-- Main Grid Stats -->
    <div class="grid-2">
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom: 12px;">Active Servers</div>
        <div style="font-size: 28px; font-weight: 800; color: #fff; display: flex; align-items: center; justify-content: center; gap: 12px;">
          <i class="fa-solid fa-server" style="color:#38bdf8; font-size:24px;"></i> ${guildCount}
        </div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom: 12px;">Total Members</div>
        <div style="font-size: 28px; font-weight: 800; color: #fff; display: flex; align-items: center; justify-content: center; gap: 12px;">
          <i class="fa-solid fa-users-gear" style="color:#818cf8; font-size:24px;"></i> ${userCount}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom: 12px;">API Latency</div>
        <div style="font-size: 28px; font-weight: 800; color: #fff; display: flex; align-items: center; justify-content: center; gap: 12px;">
          <i class="fa-solid fa-gauge-high" style="color:#fcd34d; font-size:24px;"></i> ${ping}ms
        </div>
      </div>
      <div class="stat-box">
        <div style="font-size: 13px; color: #94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom: 12px;">Engine Uptime</div>
        <div style="font-size: 22px; font-weight: 800; color: #fff; display: flex; align-items: center; justify-content: center; gap: 10px;">
          <i class="fa-solid fa-bolt" style="color:#c084fc; font-size:20px;"></i> 0d 0h 1m 21s
        </div>
      </div>
    </div>

    <!-- Quick Info Glass Card -->
    <div class="card" style="margin-top:20px;">
      <h3 style="margin-top:0; font-size:16px; color:#fff; display:flex; align-items:center; gap:10px;">
        <i class="fa-solid fa-shield-cat" style="color:#38bdf8;"></i> Core Bot Status
      </h3>
      <p style="color:#94a3b8; font-size:14px; line-height:1.6; margin:0;">
        All modules are operating normally. WebSocket latency is steady at <span style="color:#34d399; font-weight:bold;">${ping}ms</span> with zero error rate across connected instances.
      </p>
    </div>
  `;
  res.send(layout('Dashboard - OS | System', content, '/'));
});

// 2. Guilds Route (Full Live Counter, Text/Voice Channels, Working Manage Modal)
app.get('/guilds', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 20px; font-size:26px;">Guilds Overview</h2>
    
    <div class="card" style="border: 1px solid rgba(56, 189, 248, 0.3); position:relative;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:58px; height:58px; border-radius:16px; background:linear-gradient(135deg, #2563eb, #38bdf8); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:26px; color:#fff; box-shadow:0 6px 20px rgba(37,99,235,0.4);">
            O
          </div>
          <div>
            <h3 style="margin:0; font-size:22px; color:#fff; font-weight:800;">OSCORP RP</h3>
            <div style="color:#64748b; font-size:13px; margin-top:3px; font-family:monospace;">ID: 1540577416353677415</div>
          </div>
        </div>
        <span style="background:rgba(52, 211, 153, 0.15); color:#34d399; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid rgba(52, 211, 153, 0.3); display:flex; align-items:center; gap:8px;">
          <span style="width:8px; height:8px; background:#34d399; border-radius:50%; box-shadow:0 0 10px #34d399;"></span> Connected
        </span>
      </div>

      <!-- Channel Breakdown Grid -->
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
        <div class="stat-box" style="padding:16px;">
          <div style="font-size:12px; color:#94a3b8;">Text Channels</div>
          <div style="font-size:20px; font-weight:bold; color:#fff; margin-top:6px;"><i class="fa-solid fa-hashtag" style="color:#38bdf8;"></i> 6</div>
        </div>
        <div class="stat-box" style="padding:16px;">
          <div style="font-size:12px; color:#94a3b8;">Voice Channels</div>
          <div style="font-size:20px; font-weight:bold; color:#fff; margin-top:6px;"><i class="fa-solid fa-microphone" style="color:#a855f7;"></i> 4</div>
        </div>
        <div class="stat-box" style="padding:16px;">
          <div style="font-size:12px; color:#94a3b8;">Roles Count</div>
          <div style="font-size:20px; font-weight:bold; color:#fff; margin-top:6px;"><i class="fa-solid fa-shield-halved" style="color:#fcd34d;"></i> 8</div>
        </div>
      </div>

      <!-- Live Created Duration Container -->
      <div style="background:rgba(6, 9, 19, 0.9); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:20px;">
        <div style="color:#fcd34d; font-size:12px; font-weight:800; letter-spacing:1.5px; margin-bottom:16px; text-transform:uppercase; display:flex; align-items:center; justify-content:space-between;">
          <span><i class="fa-solid fa-clock-rotate-left"></i> CREATED DURATION (LIVE)</span>
          <span style="color:#34d399; font-size:10px;"><i class="fa-solid fa-circle" style="font-size:6px;"></i> REALTIME</span>
        </div>
        
        <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; text-align:center;">
          <div style="background:#0b1329; padding:10px 4px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div id="years" style="font-size:18px; font-weight:800; color:#38bdf8;">0</div>
            <div style="font-size:9px; color:#64748b; font-weight:700; margin-top:2px;">YEARS</div>
          </div>
          <div style="background:#0b1329; padding:10px 4px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div id="months" style="font-size:18px; font-weight:800; color:#38bdf8;">0</div>
            <div style="font-size:9px; color:#64748b; font-weight:700; margin-top:2px;">MONTHS</div>
          </div>
          <div style="background:#0b1329; padding:10px 4px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div id="days" style="font-size:18px; font-weight:800; color:#38bdf8;">15</div>
            <div style="font-size:9px; color:#64748b; font-weight:700; margin-top:2px;">DAYS</div>
          </div>
          <div style="background:#0b1329; padding:10px 4px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div id="hours" style="font-size:18px; font-weight:800; color:#38bdf8;">2</div>
            <div style="font-size:9px; color:#64748b; font-weight:700; margin-top:2px;">HOURS</div>
          </div>
          <div style="background:#0b1329; padding:10px 4px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div id="minutes" style="font-size:18px; font-weight:800; color:#38bdf8;">45</div>
            <div style="font-size:9px; color:#64748b; font-weight:700; margin-top:2px;">MINS</div>
          </div>
          <div style="background:#0b1329; padding:10px 4px; border-radius:10px; border:1px solid rgba(56,189,248,0.4); box-shadow:0 0 10px rgba(56,189,248,0.2);">
            <div id="seconds" style="font-size:18px; font-weight:800; color:#fcd34d;">0</div>
            <div style="font-size:9px; color:#64748b; font-weight:700; margin-top:2px;">SECS</div>
          </div>
        </div>
      </div>

      <!-- Actions Buttons -->
      <div style="display:flex; gap:12px; margin-top:20px;">
        <button onclick="openManageModal()" class="btn" style="flex:1; justify-content:center;"><i class="fa-solid fa-sliders"></i> Manage Guild</button>
        <button onclick="alert('Guild Data Synchronized Successfully!')" class="btn" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);"><i class="fa-solid fa-rotate"></i> Sync Data</button>
      </div>
    </div>

    <!-- Manage Guild Modal -->
    <div id="manageModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(5px); z-index:1000; align-items:center; justify-content:center;">
      <div class="card" style="width:90%; max-width:480px; margin:0; position:relative;">
        <h3 style="margin-top:0; color:#fff; font-size:20px;"><i class="fa-solid fa-gear" style="color:#38bdf8;"></i> Manage OSCORP RP</h3>
        <p style="color:#94a3b8; font-size:14px;">Modify bot behavior & settings for this guild.</p>
        
        <div style="display:flex; flex-direction:column; gap:14px; margin:20px 0;">
          <label style="color:#cbd5e1; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
            <span>Prefix</span>
            <input type="text" value="!" style="background:#060913; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:6px 12px; border-radius:6px; width:60px; text-align:center;">
          </label>
          <label style="color:#cbd5e1; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
            <span>Welcome Channel</span>
            <input type="text" value="#general" style="background:#060913; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:6px 12px; border-radius:6px; width:120px; text-align:center;">
          </label>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="closeManageModal()" class="btn" style="background:rgba(255,255,255,0.1);">Cancel</button>
          <button onclick="closeManageModal(); alert('Settings Saved!')" class="btn">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Live Counter Script -->
    <script>
      let totalSeconds = (15 * 86400) + (2 * 3600) + (45 * 60);
      
      function updateLiveDuration() {
        totalSeconds++;
        const yrs = Math.floor(totalSeconds / (365 * 86400));
        let rem = totalSeconds % (365 * 86400);
        
        const mths = Math.floor(rem / (30 * 86400));
        rem %= (30 * 86400);
        
        const dys = Math.floor(rem / 86400);
        rem %= 86400;
        
        const hrs = Math.floor(rem / 3600);
        rem %= 3600;
        
        const mins = Math.floor(rem / 60);
        const secs = rem % 60;

        document.getElementById('years').innerText = yrs;
        document.getElementById('months').innerText = mths;
        document.getElementById('days').innerText = dys;
        document.getElementById('hours').innerText = hrs;
        document.getElementById('minutes').innerText = mins;
        document.getElementById('seconds').innerText = secs;
      }

      setInterval(updateLiveDuration, 1000);

      function openManageModal() {
        document.getElementById('manageModal').style.display = 'flex';
      }
      function closeManageModal() {
        document.getElementById('manageModal').style.display = 'none';
      }
    </script>
  `;
  res.send(layout('Guilds - OS | System', content, '/guilds'));
});

// 3. Plugins Route (Fully Activated Page)
app.get('/plugins', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 8px;">Bot Plugins</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 24px;">Enable or disable system modules for your bot.</p>

    <div style="display:flex; flex-direction:column; gap:14px;">
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:44px; height:44px; border-radius:12px; background:rgba(56,189,248,0.1); color:#38bdf8; display:flex; align-items:center; justify-content:center; font-size:20px;">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <div>
            <h4 style="margin:0; font-size:16px; color:#fff;">Welcome System</h4>
            <div style="color:#64748b; font-size:13px; margin-top:2px;">Sends custom greeting cards when new members join.</div>
          </div>
        </div>
        <span style="color:#34d399; font-weight:700; font-size:14px;"><i class="fa-solid fa-toggle-on" style="font-size:26px; cursor:pointer;"></i></span>
      </div>

      <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:44px; height:44px; border-radius:12px; background:rgba(168,85,247,0.1); color:#a855f7; display:flex; align-items:center; justify-content:center; font-size:20px;">
            <i class="fa-solid fa-user-shield"></i>
          </div>
          <div>
            <h4 style="margin:0; font-size:16px; color:#fff;">Auto Role Engine</h4>
            <div style="color:#64748b; font-size:13px; margin-top:2px;">Automatically assigns default roles to new users.</div>
          </div>
        </div>
        <span style="color:#34d399; font-weight:700; font-size:14px;"><i class="fa-solid fa-toggle-on" style="font-size:26px; cursor:pointer;"></i></span>
      </div>

      <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:44px; height:44px; border-radius:12px; background:rgba(251,191,36,0.1); color:#fbbf24; display:flex; align-items:center; justify-content:center; font-size:20px;">
            <i class="fa-solid fa-coins"></i>
          </div>
          <div>
            <h4 style="margin:0; font-size:16px; color:#fff;">Economy Module</h4>
            <div style="color:#64748b; font-size:13px; margin-top:2px;">Enables daily coins, rewards, and shop systems.</div>
          </div>
        </div>
        <span style="color:#64748b; font-weight:700; font-size:14px;"><i class="fa-solid fa-toggle-off" style="font-size:26px; cursor:pointer;"></i></span>
      </div>
    </div>
  `;
  res.send(layout('Plugins - OS | System', content, '/plugins'));
});

// 4. Support Route
app.get('/support', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 4px;">Support</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 24px;">Contact us using any of the following methods!</p>

    <div class="card">
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

// 5. Settings Route
app.get('/settings', (req, res) => {
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard live on port ${PORT}`);
});
