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
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
      }
      .btn {
        background: #2563eb;
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
      .btn-sky {
        background: #0284c7;
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

// 1. Dashboard (Exact Layout matching drawing)
app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 9;
  const ping = client.ws?.ping || 94;

  const content = `
    <div style="margin-bottom: 20px;">
      <h2 style="margin:0; font-size: 24px; font-weight:700;">Welcome, nfyp_</h2>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Here's what's happening with <strong style="color:#fff;">OS | System</strong> today.</p>
    </div>

    <!-- 4 Stats Card Box Grid (Matching Exact Screenshot) -->
    <div class="card" style="padding:16px; margin-bottom:16px;">
      <div style="margin-bottom:12px;">
        <button class="btn btn-sky" style="padding:6px 14px; font-size:13px;" onclick="location.reload();"><i class="fa-solid fa-rotate"></i> Refresh Data</button>
      </div>

      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:1px; background:rgba(255,255,255,0.08); border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
        
        <div style="background:#0f172a; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">Server Count (Guilds)</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-bars-staggered" style="font-size:16px; color:#94a3b8;"></i> ${guildCount}
          </div>
        </div>

        <div style="background:#0f172a; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">User Count (All Guilds)</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-users" style="font-size:16px; color:#94a3b8;"></i> ${userCount}
          </div>
        </div>

        <div style="background:#0f172a; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">API Latency</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-tower-broadcast" style="font-size:16px; color:#94a3b8;"></i> ${ping}ms
          </div>
        </div>

        <div style="background:#0f172a; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">Prefix</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-bullhorn" style="font-size:16px; color:#94a3b8;"></i> -
          </div>
        </div>

      </div>

      <!-- Uptime Box Section -->
      <div style="margin-top:16px; background:#0b1224; border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:14px;">
        <span style="background:rgba(52, 211, 153, 0.2); color:#34d399; font-size:11px; padding:3px 8px; border-radius:4px; font-weight:600;"><i class="fa-solid fa-circle" style="font-size:7px;"></i> Uptime</span>
        <div style="margin-top:10px; color:#cbd5e1; font-size:14px;"><i class="fa-solid fa-rotate" style="font-size:12px; color:#64748b;"></i> 0d 0h 2m 45s</div>
      </div>
    </div>

    <!-- Lower Section: Dashboard Info -->
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

// 2. Guilds Route (With Updated Manage Guild Suggestions)
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

      <!-- Live Duration Grid -->
      <div style="background:#0b1224; border-radius:10px; padding:16px; margin-bottom:20px;">
        <div style="color:#fcd34d; font-size:11px; font-weight:700; letter-spacing:1px; margin-bottom:12px; text-transform:uppercase;">
          <i class="fa-solid fa-clock"></i> CREATED DURATION (LIVE)
        </div>
        <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:6px; text-align:center;">
          <div style="background:#0f172a; padding:8px 2px; border-radius:6px;"><div id="years" style="font-size:16px; font-weight:bold; color:#38bdf8;">0</div><div style="font-size:8px; color:#64748b;">YEARS</div></div>
          <div style="background:#0f172a; padding:8px 2px; border-radius:6px;"><div id="months" style="font-size:16px; font-weight:bold; color:#38bdf8;">0</div><div style="font-size:8px; color:#64748b;">MONTHS</div></div>
          <div style="background:#0f172a; padding:8px 2px; border-radius:6px;"><div id="days" style="font-size:16px; font-weight:bold; color:#38bdf8;">15</div><div style="font-size:8px; color:#64748b;">DAYS</div></div>
          <div style="background:#0f172a; padding:8px 2px; border-radius:6px;"><div id="hours" style="font-size:16px; font-weight:bold; color:#38bdf8;">2</div><div style="font-size:8px; color:#64748b;">HOURS</div></div>
          <div style="background:#0f172a; padding:8px 2px; border-radius:6px;"><div id="minutes" style="font-size:16px; font-weight:bold; color:#38bdf8;">45</div><div style="font-size:8px; color:#64748b;">MINS</div></div>
          <div style="background:#0f172a; padding:8px 2px; border-radius:6px;"><div id="seconds" style="font-size:16px; font-weight:bold; color:#fcd34d;">0</div><div style="font-size:8px; color:#64748b;">SECS</div></div>
        </div>
      </div>

      <div style="display:flex; gap:12px;">
        <button onclick="openManageModal()" class="btn" style="flex:1; justify-content:center;"><i class="fa-solid fa-sliders"></i> Manage Guild</button>
        <button onclick="alert('Guild Data Synchronized!')" class="btn" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);"><i class="fa-solid fa-rotate"></i> Sync Data</button>
      </div>
    </div>

    <!-- Manage Modal -->
    <div id="manageModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center;">
      <div class="card" style="width:90%; max-width:440px; margin:0;">
        <h3 style="margin-top:0; color:#fff; font-size:18px;"><i class="fa-solid fa-gear" style="color:#38bdf8;"></i> Manage OSCORP RP</h3>
        <p style="color:#94a3b8; font-size:13px;">Modify bot behavior & settings for this guild.</p>
        
        <div style="display:flex; flex-direction:column; gap:14px; margin:20px 0;">
          <label style="color:#cbd5e1; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
            <span>Prefix</span>
            <input type="text" value="!" style="background:#060913; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 12px; border-radius:6px; width:70px; text-align:center;">
          </label>
          <label style="color:#cbd5e1; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
            <span>Log Channel (Recommended)</span>
            <input type="text" value="#logs" style="background:#060913; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 12px; border-radius:6px; width:110px; text-align:center;">
          </label>
          <label style="color:#cbd5e1; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
            <span>Bot Nickname</span>
            <input type="text" value="OS | System" style="background:#060913; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 12px; border-radius:6px; width:110px; text-align:center;">
          </label>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="closeManageModal()" class="btn" style="background:rgba(255,255,255,0.1);">Cancel</button>
          <button onclick="closeManageModal(); alert('Changes Saved!')" class="btn">Save Changes</button>
        </div>
      </div>
    </div>

    <script>
      let totalSeconds = (15 * 86400) + (2 * 3600) + (45 * 60);
      setInterval(() => {
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
      }, 1000);

      function openManageModal() { document.getElementById('manageModal').style.display = 'flex'; }
      function closeManageModal() { document.getElementById('manageModal').style.display = 'none'; }
    </script>
  `;
  res.send(layout('Guilds - OS | System', content, '/guilds'));
});

// 3. Plugins Route (Restored Original Items & Icons including Ban/Kick)
app.get('/plugins', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 6px; font-size:24px;">Bot Plugins</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 20px; font-size:14px;">Enable or disable system modules for your bot.</p>

    <div style="display:flex; flex-direction:column; gap:12px;">
      
      <!-- Moderation / Ban & Kick -->
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(239, 68, 68, 0.15); color:#ef4444; display:flex; align-items:center; justify-content:center; font-size:18px;">
            <i class="fa-solid fa-gavel"></i>
          </div>
          <div>
            <h4 style="margin:0; font-size:15px; color:#fff;">Moderation System (Ban / Kick)</h4>
            <div style="color:#64748b; font-size:12px; margin-top:2px;">Enable commands like ban, kick, timeout, and warn.</div>
          </div>
        </div>
        <span style="color:#34d399; font-size:24px; cursor:pointer;"><i class="fa-solid fa-toggle-on"></i></span>
      </div>

      <!-- Welcome System -->
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(56,189,248,0.15); color:#38bdf8; display:flex; align-items:center; justify-content:center; font-size:18px;">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <div>
            <h4 style="margin:0; font-size:15px; color:#fff;">Welcome System</h4>
            <div style="color:#64748b; font-size:12px; margin-top:2px;">Sends custom greeting cards when new members join.</div>
          </div>
        </div>
        <span style="color:#34d399; font-size:24px; cursor:pointer;"><i class="fa-solid fa-toggle-on"></i></span>
      </div>

      <!-- Auto Role Engine -->
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(168,85,247,0.15); color:#a855f7; display:flex; align-items:center; justify-content:center; font-size:18px;">
            <i class="fa-solid fa-user-shield"></i>
          </div>
          <div>
            <h4 style="margin:0; font-size:15px; color:#fff;">Auto Role Engine</h4>
            <div style="color:#64748b; font-size:12px; margin-top:2px;">Automatically assigns default roles to new users.</div>
          </div>
        </div>
        <span style="color:#34d399; font-size:24px; cursor:pointer;"><i class="fa-solid fa-toggle-on"></i></span>
      </div>

      <!-- Economy Module -->
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(251,191,36,0.15); color:#fbbf24; display:flex; align-items:center; justify-content:center; font-size:18px;">
            <i class="fa-solid fa-coins"></i>
          </div>
          <div>
            <h4 style="margin:0; font-size:15px; color:#fff;">Economy Module</h4>
            <div style="color:#64748b; font-size:12px; margin-top:2px;">Enables daily coins, rewards, and shop systems.</div>
          </div>
        </div>
        <span style="color:#64748b; font-size:24px; cursor:pointer;"><i class="fa-solid fa-toggle-off"></i></span>
      </div>

    </div>
  `;
  res.send(layout('Plugins - OS | System', content, '/plugins'));
});

// 4. Settings Route
app.get('/settings', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 6px; font-size:24px;">Global Settings</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 20px; font-size:14px;">Configure general system configurations for OS | System.</p>

    <div class="card">
      <h3 style="margin-top:0; font-size:16px; color:#fff;"><i class="fa-solid fa-sliders" style="color:#38bdf8;"></i> System Configuration</h3>
      <p style="color:#94a3b8; font-size:13px;">Manage global dashboard parameters.</p>
      
      <div style="display:flex; flex-direction:column; gap:14px; margin-top:16px;">
        <label style="color:#cbd5e1; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
          <span>Maintenance Mode</span>
          <input type="checkbox" style="width:18px; height:18px;">
        </label>
        <label style="color:#cbd5e1; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
          <span>Debug Logging</span>
          <input type="checkbox" checked style="width:18px; height:18px;">
        </label>
      </div>
    </div>
  `;
  res.send(layout('Settings - OS | System', content, '/settings'));
});

// 5. Support Route
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

app.listen(PORT, () => {
  console.log(`🌐 Dashboard live on port ${PORT}`);
});
