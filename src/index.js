const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startTime = Date.now();
const guildCreatedAt = new Date('2025-05-15T00:00:00Z').getTime();

// دالة جلب صورة المستخدم من ديسكورد
function getUserAvatar(user) {
  try {
    if (user && user.avatar) {
      const isAnimated = typeof user.avatar === 'string' && user.avatar.startsWith('a_');
      const format = isAnimated ? 'gif' : 'png';
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=512`;
    }
    if (user && user.discriminator && user.discriminator !== '0') {
      const defaultIndex = parseInt(user.discriminator, 10) % 5;
      return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    }
    if (user && user.id) {
      const idNum = parseInt(String(user.id).slice(-4), 10) || 0;
      return `https://cdn.discordapp.com/embed/avatars/${idNum % 6}.png`;
    }
  } catch (e) {
    console.error('Avatar error:', e);
  }
  return 'https://cdn.discordapp.com/embed/avatars/0.png';
}

// دالة جلب صورة السيرفر من ديسكورد
function getGuildIcon(guild) {
  try {
    if (guild && guild.icon) {
      const isAnimated = typeof guild.icon === 'string' && guild.icon.startsWith('a_');
      const format = isAnimated ? 'gif' : 'png';
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${format}?size=512`;
    }
  } catch (e) {
    console.error('Guild icon error:', e);
  }
  return 'https://cdn.discordapp.com/embed/avatars/1.png';
}

// بيانات مؤقتة تمثل بيانات المستخدم والسيرفر
const currentUser = { id: '154057416353677415', avatar: null, discriminator: '0' };
const currentGuild = { id: '119830128491028391', icon: null };

const userAvatarUrl = getUserAvatar(currentUser);
const guildIconUrl = getGuildIcon(currentGuild);

let botConfig = {
  clientId: '154057416353677415',
  prefix: '-',
  port: '1337'
};

let pluginsList = [
  { id: 'ban', name: 'Ban', dev: 'Mohammed Alhajri', desc: 'Bans a user from the server.', usage: '-ban {@user}', aliases: 'خلخو', icon: 'fa-gavel', color: '#ef4444', enabled: true },
  { id: 'clear', name: 'clear', dev: 'Mohammed Alhajri', desc: 'Clears messages from a channel.', usage: '-clear {amount}', aliases: 'None', icon: 'fa-trash-alt', color: '#06b6d4', enabled: true },
  { id: 'coin', name: 'coin', dev: 'Mohammed Alhajri', desc: 'Simple coin flip command', usage: '-coin', aliases: 'None', icon: 'fa-coins', color: '#eab308', enabled: true },
  { id: 'kick', name: 'kick', dev: 'Mohammed Alhajri', desc: 'Kicks a user from the server.', usage: '-kick {@user}', aliases: 'None', icon: 'fa-user-minus', color: '#f97316', enabled: true },
  { id: 'ping', name: 'ping', dev: 'Mohammed Alhajri', desc: 'Ping / Pong!', usage: '-ping', aliases: 'None', icon: 'fa-tachometer-alt', color: '#10b981', enabled: true }
];

function getUptime() {
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getGuildAgeParts() {
  const diff = Math.floor((Date.now() - guildCreatedAt) / 1000);
  const years = Math.floor(diff / (365 * 24 * 3600));
  const months = Math.floor((diff % (365 * 24 * 3600)) / (30 * 24 * 3600));
  const days = Math.floor((diff % (30 * 24 * 3600)) / (24 * 3600));
  const hours = Math.floor((diff % (24 * 3600)) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return { years, months, days, hours, minutes, seconds };
}

function renderLayout(title, content) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - OS | System</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
      <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          body { background-color: #0b0f19; color: #94a3b8; display: flex; flex-direction: column; min-height: 100vh; }
          .dhikr-banner { background: linear-gradient(90deg, #0f172a, #1e1b4b, #0f172a); color: #facc15; text-align: center; padding: 12px; font-weight: bold; font-size: 16px; border-bottom: 1px solid #312e81; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
          .navbar { background: #111827; padding: 15px 20px; border-bottom: 1px solid #1f2937; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 100; }
          .sidebar-toggle { color: #fff; font-size: 20px; cursor: pointer; padding: 8px 12px; background: #1f2937; border-radius: 6px; }
          .user-profile { display: flex; align-items: center; gap: 10px; color: #fff; }
          .layout { display: flex; flex: 1; position: relative; }
          .sidebar { 
              position: fixed; top: 0; left: -280px; width: 280px; height: 100%; background: #111827; border-right: 1px solid #1f2937; 
              padding: 20px 0; z-index: 999; transition: all 0.3s ease; box-shadow: 5px 0 25px rgba(0,0,0,0.5);
          }
          .sidebar.active { left: 0; }
          .sidebar-header { padding: 0 20px 20px 20px; border-bottom: 1px solid #1f2937; margin-bottom: 15px; display: flex; align-items: center; gap: 12px; }
          .sidebar a { display: flex; align-items: center; gap: 12px; padding: 14px 25px; color: #94a3b8; text-decoration: none; font-weight: 500; transition: 0.2s; }
          .sidebar a:hover, .sidebar a.active { background: #1f2937; color: #38bdf8; border-left: 4px solid #38bdf8; }
          .overlay-backdrop { display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 998; }
          .overlay-backdrop.active { display: block; }
          .main-content { flex: 1; padding: 25px; background: #0b0f19; overflow-y: auto; }
          .card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
          .card-header { font-size: 18px; font-weight: bold; color: #f3f4f6; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
          .stat-box { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 15px; text-align: center; }
          .stat-value { font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 5px; }
          .btn { background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
          .btn-success { background: #16a34a; }
          .form-control { width: 100%; padding: 10px; background: #1f2937; border: 1px solid #374151; border-radius: 6px; color: #fff; outline: none; margin-top: 5px; }
          .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
          .switch input { opacity: 0; width: 0; height: 0; }
          .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #374151; transition: .4s; border-radius: 22px; }
          .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
          input:checked + .slider { background-color: #2563eb; }
          input:checked + .slider:before { transform: translateX(22px); }
          .link-blue { color: #38bdf8; text-decoration: none; font-weight: bold; }
          .link-blue:hover { text-decoration: underline; }
          .img-avatar-fixed { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #38bdf8; object-fit: cover; background-color: #1e293b; }
          .img-guild-fixed { width: 65px; height: 65px; border-radius: 50%; border: 2px solid #38bdf8; box-shadow: 0 0 15px rgba(56,189,248,0.3); object-fit: cover; background-color: #1e293b; }
          .footer { text-align: center; padding: 20px; background: #111827; border-top: 1px solid #1f2937; font-size: 13px; color: #6b7280; }
      </style>
  </head>
  <body>
      <div class="dhikr-banner">✨ سبحان الله وبحمده ، سبحان الله العظيم ✨</div>
      <div class="navbar">
          <div class="sidebar-toggle" onclick="toggleSidebar()"><i class="fas fa-bars"></i></div>
          <div class="user-profile">
              <img src="${userAvatarUrl}" class="img-avatar-fixed" />
              <span>nfyp_ <small style="color:#6b7280">Admin</small></span>
          </div>
      </div>
      <div class="layout">
          <div class="overlay-backdrop" id="backdrop" onclick="toggleSidebar()"></div>
          <div class="sidebar" id="sidebar">
              <div class="sidebar-header">
                  <img src="${userAvatarUrl}" class="img-avatar-fixed" style="width:45px; height:45px;" />
                  <div>
                      <h4 style="color:#fff;">nfyp_</h4>
                      <span style="font-size:12px; color:#38bdf8;">Administrator</span>
                  </div>
              </div>
              <a href="/dashboard"><i class="fas fa-home"></i> Dashboard</a>
              <a href="/plugins"><i class="fas fa-rocket"></i> Plugins</a>
              <a href="/guilds"><i class="fas fa-server"></i> Guilds</a>
              <a href="/support"><i class="fas fa-question-circle"></i> Support</a>
              <a href="/settings"><i class="fas fa-cog"></i> Settings</a>
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

app.get('/', (req, res) => res.redirect('/dashboard'));

app.get('/dashboard', (req, res) => {
  const content = `
      <h2 style="color:#fff; margin-bottom: 5px;">Welcome, nfyp_</h2>
      <p style="margin-bottom: 20px;">Here's what's happening with <b>OS | System</b> today.</p>
      <div class="grid">
          <div class="stat-box"><div>Server Count</div><div class="stat-value">📊 1</div></div>
          <div class="stat-box"><div>User Count</div><div class="stat-value">👥 9</div></div>
          <div class="stat-box"><div>API Latency</div><div class="stat-value">⚡ 94ms</div></div>
          <div class="stat-box"><div>System Uptime</div><div class="stat-value">⏱️ ${getUptime()}</div></div>
      </div>
      <div class="card">
          <div class="card-header"><i class="fas fa-bullhorn" style="color:#38bdf8"></i> Dashboard Notice</div>
          <p>Welcome to Discord BOT Dashboard V2, this is an early version of the final product! Please report any issues you find!</p>
          <p style="margin-top:10px;"><b>Version:</b> 3.5</p>
      </div>
      <div class="card">
          <div class="card-header"><i class="fas fa-info-circle" style="color:#38bdf8"></i> OS | System - Details</div>
          <p style="margin-bottom:6px;"><b>Username:</b> OS | System#3523</p>
          <p style="margin-bottom:6px;"><b>Client ID:</b> 154057416353677415</p>
          <p style="margin-bottom:6px;"><b>Joined:</b> Saturday, August 22nd, 2026</p>
      </div>
  `;
  res.send(renderLayout('Dashboard', content));
});

app.get('/plugins', (req, res) => {
  let pluginsHTML = pluginsList.map(p => `
      <div class="card" style="position:relative; overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
              <h3 style="color:#fff; display:flex; align-items:center; gap:12px;">
                  <div style="width:42px; height:42px; border-radius:10px; background:${p.color}22; border:1px solid ${p.color}; display:flex; align-items:center; justify-content:center;">
                      <i class="fas ${p.icon}" style="color:${p.color}; font-size:20px;"></i>
                  </div>
                  ${p.name}
              </h3>
              <label class="switch">
                  <input type="checkbox" ${p.enabled ? 'checked' : ''} onchange="fetch('/api/plugins/toggle/${p.id}', {method:'POST'})">
                  <span class="slider"></span>
              </label>
          </div>
          <p style="margin: 12px 0 6px 0; font-size: 14px;"><b>Developer:</b> ${p.dev}</p>
          <p style="margin: 6px 0; font-size: 14px;"><b>Description:</b> ${p.desc}</p>
          <p style="margin: 6px 0; font-size: 14px;"><b>Aliases:</b> <span style="color:#38bdf8">${p.aliases}</span></p>
          <div style="margin-top:12px;">
              <button onclick="editAlias('${p.id}', '${p.aliases}')" class="btn"><i class="fas fa-edit"></i> Edit</button>
          </div>
      </div>
  `).join('');

  const content = `
      <h2 style="color:#fff; margin-bottom: 10px;">Plugins</h2>
      ${pluginsHTML}
      <script>
          function editAlias(id, old) {
              const val = prompt('Edit Aliases:', old);
              if(val !== null) {
                  fetch('/api/plugins/alias/' + id, {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ alias: val })
                  }).then(() => location.reload());
              }
          }
      </script>
  `;
  res.send(renderLayout('Plugins', content));
});

app.get('/guilds', (req, res) => {
  const age = getGuildAgeParts();
  const content = `
      <h2 style="color:#fff; margin-bottom: 10px;">Guilds</h2>
      <p style="margin-bottom: 20px;">See all the Guilds (Servers) that your BOT is in.</p>
      <div class="card">
          <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #1f2937;">
              <img src="${guildIconUrl}" class="img-guild-fixed" />
              <div>
                  <h2 style="color:#fff;">Oscorp (OSCORP RP)</h2>
                  <p style="font-size:13px; color:#94a3b8;"><b>Guild ID:</b> 119830128491028391</p>
                  <p style="font-size:13px; color:#94a3b8;"><b>Owner:</b> nfyp_</p>
              </div>
          </div>
          <div class="grid">
              <div class="stat-box"><div>Total Members</div><div class="stat-value">👥 9</div></div>
              <div class="stat-box"><div>Total Roles</div><div class="stat-value">🛡️ 8</div></div>
              <div class="stat-box"><div>Text Channels</div><div class="stat-value">💬 10</div></div>
              <div class="stat-box"><div>Voice Channels</div><div class="stat-value">🔊 4</div></div>
          </div>
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%); padding: 25px; border-radius: 16px; border: 1px solid #312e81; box-shadow: 0 10px 30px rgba(0,0,0,0.6); text-align: center; margin-top:20px; position:relative; overflow:hidden;">
              <h4 style="color: #facc15; font-size: 16px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; font-weight:800;">
                  <i class="fas fa-crown" style="margin-right: 8px; color:#facc15;"></i> Server Created Duration
              </h4>
              <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                  <div style="background:#111827; border:1px solid #374151; padding:10px 14px; border-radius:10px; min-width:80px;"><span style="font-size:22px; font-weight:bold; color:#38bdf8;">${age.years}</span><div style="font-size:10px; color:#94a3b8;">Years</div></div>
                  <div style="background:#111827; border:1px solid #374151; padding:10px 14px; border-radius:10px; min-width:80px;"><span style="font-size:22px; font-weight:bold; color:#38bdf8;">${age.months}</span><div style="font-size:10px; color:#94a3b8;">Months</div></div>
                  <div style="background:#111827; border:1px solid #374151; padding:10px 14px; border-radius:10px; min-width:80px;"><span style="font-size:22px; font-weight:bold; color:#38bdf8;">${age.days}</span><div style="font-size:10px; color:#94a3b8;">Days</div></div>
                  <div style="background:#111827; border:1px solid #374151; padding:10px 14px; border-radius:10px; min-width:80px;"><span style="font-size:22px; font-weight:bold; color:#38bdf8;">${age.hours}</span><div style="font-size:10px; color:#94a3b8;">Hours</div></div>
                  <div style="background:#111827; border:1px solid #374151; padding:10px 14px; border-radius:10px; min-width:80px;"><span style="font-size:22px; font-weight:bold; color:#38bdf8;">${age.minutes}</span><div style="font-size:10px; color:#94a3b8;">Mins</div></div>
                  <div style="background:#111827; border:1px solid #374151; padding:10px 14px; border-radius:10px; min-width:80px;"><span style="font-size:22px; font-weight:bold; color:#38bdf8;">${age.seconds}</span><div style="font-size:10px; color:#94a3b8;">Secs</div></div>
              </div>
          </div>
      </div>
  `;
  res.send(renderLayout('Guilds', content));
});

app.get('/support', (req, res) => {
  const content = `
      <h2 style="color:#fff; margin-bottom: 10px;">Support</h2>
      <p style="margin-bottom: 20px;">Contact us using any of the following methods!</p>
      <div class="card">
          <div class="card-header"><i class="fas fa-envelope" style="color:#38bdf8"></i> Contact Details</div>
          <p style="margin-bottom:12px;"><b>Email:</b> <a href="mailto:mail@MohammedAlhajri-dev.com" class="link-blue">mail@MohammedAlhajri-dev.com</a></p>
          <p style="margin-bottom:12px;"><b>Twitter:</b> <a href="https://x.com/i661y" target="_blank" class="link-blue">@i661y</a></p>
          <p style="margin-bottom:12px;"><b>Instagram:</b> <a href="https://instagram.com/i661y" target="_blank" class="link-blue">@i661y</a></p>
          <p style="margin-bottom:12px;"><b>Discord Developer:</b> <span style="color:#fff;">Mohammed Alhajri</span></p>
          <div style="margin-top:20px;">
              <a href="https://discord.gg" target="_blank" class="btn" style="background:#5865F2;"><i class="fab fa-discord"></i> Join Discord Server</a>
          </div>
      </div>
  `;
  res.send(renderLayout('Support', content));
});

app.get('/settings', (req, res) => {
  const content = `
      <h2 style="color:#fff; margin-bottom: 10px;">Settings</h2>
      <p style="margin-bottom: 20px;">Customize your BOT and update settings within the dashboard!</p>
      <form method="POST" action="/settings/save" class="card">
          <div class="card-header"><i class="fas fa-sliders-h" style="color:#38bdf8"></i> BOT Config</div>
          <div style="margin-bottom: 15px;">
              <label style="display:block; color:#d1d5db; margin-bottom:5px;">Bot Prefix:</label>
              <input type="text" id="prefixInput" name="prefix" class="form-control" value="${botConfig.prefix}">
          </div>
          <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> Save Settings</button>
      </form>
  `;
  res.send(renderLayout('Settings', content));
});

app.post('/settings/save', (req, res) => {
  if (req.body.prefix && req.body.prefix.length <= 1) {
    botConfig.prefix = req.body.prefix;
  }
  res.redirect('/settings');
});

app.post('/api/plugins/toggle/:id', (req, res) => {
  const p = pluginsList.find(x => x.id === req.params.id);
  if (p) p.enabled = !p.enabled;
  res.json({ success: true });
});

app.post('/api/plugins/alias/:id', (req, res) => {
  const p = pluginsList.find(x => x.id === req.params.id);
  if (p) p.aliases = req.body.alias || 'None';
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});