const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= =================
// 1. إعدادات وتشغيل بوت ديسكورد
// ================= =================
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
    console.error('❌ فشل تسجيل دخول البوت! تأكد من صحة التوكن:', err.message);
  });
} else {
  console.log('⚠️ لم يتم العثور على DISCORD_TOKEN في متغيرات البيئة.');
}

// ================= =================
// 2. إعدادات البيانات والصفحات
// ================= =================
const startTime = Date.now();

const currentUser = { 
  id: '154057416353677415', 
  username: 'nfyp_', 
  global_name: 'nfyp_',
  email: 'nfyp@discord.app',
  avatar: null, 
  discriminator: '0' 
};

function getUserAvatar(user) {
  try {
    if (user && user.avatar) {
      const isAnimated = typeof user.avatar === 'string' && user.avatar.startsWith('a_');
      const format = isAnimated ? 'gif' : 'png';
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=512`;
    }
  } catch (e) {}
  return 'https://cdn.discordapp.com/embed/avatars/0.png';
}

const userAvatarUrl = getUserAvatar(currentUser);

let botConfig = {
  clientId: '154057416353677415',
  prefix: '-',
  port: '1337'
};

let pluginsList = [
  { id: 'ban', name: 'Ban', dev: 'Mohammed Alhajri', desc: 'Bans a user from the server.', usageTemplate: 'ban {@user}', aliases: ['خلخو'], icon: 'fa-gavel', color: '#ef4444', enabled: true },
  { id: 'clear', name: 'Clear', dev: 'Mohammed Alhajri', desc: 'Clears messages from a channel.', usageTemplate: 'clear {amount}', aliases: [], icon: 'fa-trash-alt', color: '#06b6d4', enabled: true },
  { id: 'coin', name: 'Coin', dev: 'Mohammed Alhajri', desc: 'Simple coin flip command', usageTemplate: 'coin', aliases: [], icon: 'fa-coins', color: '#eab308', enabled: true },
  { id: 'kick', name: 'Kick', dev: 'Mohammed Alhajri', desc: 'Kicks a user from the server.', usageTemplate: 'kick {@user}', aliases: [], icon: 'fa-user-minus', color: '#f97316', enabled: true },
  { id: 'ping', name: 'Ping', dev: 'Mohammed Alhajri', desc: 'Ping / Pong!', usageTemplate: 'ping', aliases: [], icon: 'fa-tachometer-alt', color: '#10b981', enabled: true }
];

function renderLayout(title, activePath, content) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - OS | System</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
      <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          body { background-color: #0b0e14; color: #94a3b8; display: flex; flex-direction: column; min-height: 100vh; }
          .navbar { background: #0f131d; padding: 12px 18px; border-bottom: 1px solid #1a202c; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 100; }
          .sidebar-toggle { color: #fff; font-size: 18px; cursor: pointer; padding: 6px 10px; background: transparent; border-radius: 4px; }
          .user-profile { display: flex; align-items: center; gap: 8px; color: #fff; }
          .layout { display: flex; flex: 1; position: relative; }
          .sidebar { 
              position: fixed; top: 0; left: -280px; width: 280px; height: 100%; background: #0f131d; border-right: 1px solid #1a202c; 
              padding: 20px 0; z-index: 999; transition: all 0.3s ease; box-shadow: 5px 0 25px rgba(0,0,0,0.5);
          }
          .sidebar.active { left: 0; }
          .sidebar-header { padding: 0 20px 20px 20px; border-bottom: 1px solid #1a202c; margin-bottom: 15px; display: flex; align-items: center; gap: 12px; }
          .sidebar a { display: flex; align-items: center; gap: 12px; padding: 14px 25px; color: #94a3b8; text-decoration: none; font-weight: 500; transition: 0.2s; }
          .sidebar a:hover, .sidebar a.active { background: #1a202c; color: #38bdf8; border-left: 4px solid #38bdf8; }
          .overlay-backdrop { display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 998; }
          .overlay-backdrop.active { display: block; }
          .main-content { flex: 1; padding: 18px; background: #0b0e14; overflow-y: auto; }
          
          .card { background: #0f131d; border: 1px solid #1a202c; border-radius: 8px; padding: 16px; margin-bottom: 14px; }
          .card-header { font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
          
          .stats-card-container { background: #0f131d; border: 1px solid #1a202c; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
          .refresh-btn-bar { padding: 10px 12px; border-bottom: 1px solid #1a202c; }
          .btn-refresh { background: #1d4ed8; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
          .stats-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); }
          .stat-item { padding: 16px 10px; text-align: center; border-right: 1px solid #1a202c; }
          .stat-item:last-child { border-right: none; }
          .stat-title { font-size: 11px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; white-space: nowrap; }
          .stat-val { font-size: 16px; font-weight: 700; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 5px; }

          .uptime-badge { display: inline-flex; align-items: center; gap: 6px; background: #064e3b; color: #34d399; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; margin-bottom: 12px; }
          .uptime-dot { width: 6px; height: 6px; background: #34d399; border-radius: 50%; }

          .btn { background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
          .form-control { width: 100%; padding: 10px; background: #1a202c; border: 1px solid #2d3748; border-radius: 6px; color: #fff; outline: none; margin-top: 5px; margin-bottom: 12px; }
          .img-avatar-fixed { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background-color: #1e293b; }
          .footer { text-align: center; padding: 15px; background: #0f131d; border-top: 1px solid #1a202c; font-size: 12px; color: #6b7280; }

          .details-list { list-style: none; padding-left: 5px; margin-top: 10px; }
          .details-list li { color: #cbd5e1; font-size: 14px; margin-bottom: 8px; font-weight: 500; }
          .details-list li b { color: #ffffff; }

          .plugin-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #131825; border: 1px solid #1a202c; border-radius: 6px; margin-bottom: 8px; }
          .plugin-info { display: flex; align-items: center; gap: 12px; }
          .plugin-icon { width: 36px; height: 36px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; }

          @media (max-width: 600px) {
              .stats-grid-4 { grid-template-columns: repeat(2, 1fr); }
              .stat-item { border-bottom: 1px solid #1a202c; }
              .stat-item:nth-child(2) { border-right: none; }
              .stat-item:nth-child(3) { border-bottom: none; }
              .stat-item:nth-child(4) { border-bottom: none; border-right: none; }
          }
      </style>
  </head>
  <body>
      <div class="navbar">
          <div class="sidebar-toggle" onclick="toggleSidebar()"><i class="fas fa-bars"></i></div>
          <div class="user-profile">
              <img src="${userAvatarUrl}" class="img-avatar-fixed" />
          </div>
      </div>
      <div class="layout">
          <div class="overlay-backdrop" id="backdrop" onclick="toggleSidebar()"></div>
          <div class="sidebar" id="sidebar">
              <div class="sidebar-header">
                  <img src="${userAvatarUrl}" class="img-avatar-fixed" style="width:40px; height:40px;" />
                  <div>
                      <h4 style="color:#fff;">nfyp_</h4>
                      <span style="font-size:12px; color:#38bdf8;">Administrator</span>
                  </div>
              </div>
              <a href="/dashboard" class="${activePath === '/dashboard' ? 'active' : ''}"><i class="fas fa-home"></i> Dashboard</a>
              <a href="/plugins" class="${activePath === '/plugins' ? 'active' : ''}"><i class="fas fa-rocket"></i> Plugins</a>
              <a href="/guilds" class="${activePath === '/guilds' ? 'active' : ''}"><i class="fas fa-server"></i> Guilds</a>
              <a href="/support" class="${activePath === '/support' ? 'active' : ''}"><i class="fas fa-question-circle"></i> Support</a>
              <a href="/settings" class="${activePath === '/settings' ? 'active' : ''}"><i class="fas fa-cog"></i> Settings</a>
          </div>
          <div class="main-content">${content}</div>
      </div>
      <div class="footer">Discord BOT Dashboard V2 - Mohammed Alhajri</div>
      <script>
          function toggleSidebar() {
              document.getElementById('sidebar').classList.toggle('active');
              document.getElementById('backdrop').classList.toggle('active');
          }
      </script>
  </body>
  </html>
  `;
}

// 1. الرئيسية
app.get('/', (req, res) => res.redirect('/dashboard'));

app.get('/dashboard', (req, res) => {
  const guildCount = client.guilds ? client.guilds.cache.size : 1;
  const userCount = client.users ? client.users.cache.size : 9;
  const ping = client.ws && client.ws.ping > 0 ? Math.round(client.ws.ping) : 94;

  const content = `
      <h3 style="color:#fff; font-size:18px; font-weight:600; margin-bottom:4px;">Welcome, nfyp_</h3>
      <p style="font-size:13px; color:#94a3b8; margin-bottom:16px;">Here's what's happening with <b>OS | System</b> today.</p>
      
      <div class="stats-card-container">
          <div class="refresh-btn-bar">
              <button class="btn-refresh" onclick="location.reload()">
                  <i class="fas fa-sync-alt" style="font-size:12px;"></i> Refresh Data
              </button>
          </div>
          <div class="stats-grid-4">
              <div class="stat-item">
                  <div class="stat-title">Server Count (Guilds)</div>
                  <div class="stat-val"><i class="fas fa-bars" style="font-size:13px; color:#94a3b8;"></i> ${guildCount}</div>
              </div>
              <div class="stat-item">
                  <div class="stat-title">User Count (All Guilds)</div>
                  <div class="stat-val"><i class="fas fa-users" style="font-size:13px; color:#94a3b8;"></i> ${userCount}</div>
              </div>
              <div class="stat-item">
                  <div class="stat-title">API Latency</div>
                  <div class="stat-val"><i class="fas fa-broadcast-tower" style="font-size:13px; color:#94a3b8;"></i> ${ping}ms</div>
              </div>
              <div class="stat-item">
                  <div class="stat-title">Prefix</div>
                  <div class="stat-val"><i class="fas fa-bullhorn" style="font-size:13px; color:#94a3b8;"></i> ${botConfig.prefix}</div>
              </div>
          </div>
      </div>

      <div class="card">
          <div class="uptime-badge">
              <div class="uptime-dot"></div> Uptime
          </div>
          <div style="color:#ffffff; font-size:14px; font-weight:500;">
              <i class="fas fa-sync-alt" style="font-size:12px; margin-right:6px; color:#94a3b8;"></i>
              <span id="uptimeValue">0d 0h 0m 0s</span>
          </div>
      </div>

      <div class="card">
          <div class="card-header">🎉 Welcome</div>
          <p style="font-size:13px; color:#cbd5e1; line-height:1.5;">Welcome to Discord BOT Dashboard V2!</p>
          <p style="font-size:13px; color:#ffffff; font-weight:600; margin-top:12px;">Version: 3.0</p>
      </div>

      <div class="card">
          <div class="card-header">🔎 OS | System - Details</div>
          <ul class="details-list">
              <li>• <b>Username:</b> ${client.user ? client.user.tag : 'OS | System#3523'}</li>
              <li>• <b>Client ID:</b> ${client.user ? client.user.id : '154057416353677415'}</li>
          </ul>
      </div>

      <script>
          const startTime = ${startTime};
          function updateLiveUptime() {
              const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
              const days = Math.floor(totalSeconds / 86400);
              const hours = Math.floor((totalSeconds % 86400) / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              const seconds = totalSeconds % 60;
              document.getElementById('uptimeValue').innerText = \`\${days}d \${hours}h \${minutes}m \${seconds}s\`;
          }
          updateLiveUptime();
          setInterval(updateLiveUptime, 1000);
      </script>
  `;
  res.send(renderLayout('Dashboard', '/dashboard', content));
});

// 2. صفحة الـ Plugins
app.get('/plugins', (req, res) => {
  let pluginsHTML = pluginsList.map(p => `
      <div class="plugin-item">
          <div class="plugin-info">
              <div class="plugin-icon" style="background:${p.color};"><i class="fas ${p.icon}"></i></div>
              <div>
                  <h4 style="color:#fff; font-size:15px;">${p.name}</h4>
                  <p style="font-size:12px; color:#94a3b8;">${p.desc}</p>
              </div>
          </div>
          <span style="background:${p.enabled ? '#064e3b' : '#7f1d1d'}; color:${p.enabled ? '#34d399' : '#f87171'}; padding:4px 8px; border-radius:4px; font-size:12px;">
              ${p.enabled ? 'Enabled' : 'Disabled'}
          </span>
      </div>
  `).join('');

  const content = `
      <h3 style="color:#fff; font-size:18px; font-weight:600; margin-bottom:12px;">Bot Plugins & Commands</h3>
      <div class="card">
          <div class="card-header"><i class="fas fa-puzzle-piece" style="color:#38bdf8;"></i> Active Plugins</div>
          ${pluginsHTML}
      </div>
  `;
  res.send(renderLayout('Plugins', '/plugins', content));
});

// 3. صفحة الـ Guilds
app.get('/guilds', (req, res) => {
  const content = `
      <h3 style="color:#fff; font-size:18px; font-weight:600; margin-bottom:12px;">Connected Servers</h3>
      <div class="card">
          <div class="card-header"><i class="fas fa-server" style="color:#38bdf8;"></i> Server List</div>
          <div class="plugin-item">
              <div class="plugin-info">
                  <div class="plugin-icon" style="background:#3b82f6;"><i class="fas fa-shield-alt"></i></div>
                  <div>
                      <h4 style="color:#fff; font-size:15px;">OSCORP RP</h4>
                      <p style="font-size:12px; color:#94a3b8;">ID: 154057416353677415 | Members: 9</p>
                  </div>
              </div>
              <span style="background:#064e3b; color:#34d399; padding:4px 8px; border-radius:4px; font-size:12px;">Connected</span>
          </div>
      </div>
  `;
  res.send(renderLayout('Guilds', '/guilds', content));
});

// 4. صفحة الدعم Support
app.get('/support', (req, res) => {
  const content = `
      <h3 style="color:#fff; font-size:18px; font-weight:600; margin-bottom:12px;">Support & Help</h3>
      <div class="card">
          <div class="card-header"><i class="fas fa-headset" style="color:#38bdf8;"></i> Need Help?</div>
          <p style="font-size:14px; color:#cbd5e1; margin-bottom:12px;">If you encounter any issues or need custom configurations, feel free to contact developer Mohammed Alhajri.</p>
          <a href="https://discord.gg" target="_blank" class="btn"><i class="fab fa-discord"></i> Join Support Discord</a>
      </div>
  `;
  res.send(renderLayout('Support', '/support', content));
});

// 5. صفحة الإعدادات Settings
app.get('/settings', (req, res) => {
  const content = `
      <h3 style="color:#fff; font-size:18px; font-weight:600; margin-bottom:12px;">Bot Settings</h3>
      <div class="card">
          <div class="card-header"><i class="fas fa-sliders-h" style="color:#38bdf8;"></i> Configuration</div>
          <form action="/settings/save" method="POST">
              <label style="font-size:13px; color:#94a3b8;">Bot Prefix</label>
              <input type="text" name="prefix" class="form-control" value="${botConfig.prefix}" />
              
              <label style="font-size:13px; color:#94a3b8;">Dashboard Port</label>
              <input type="text" name="port" class="form-control" value="${botConfig.port}" readonly />

              <button type="button" class="btn" onclick="alert('Settings Saved Successfully!')"><i class="fas fa-save"></i> Save Settings</button>
          </form>
      </div>
  `;
  res.send(renderLayout('Settings', '/settings', content));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🌐 Dashboard Server running on port ' + PORT);
});
