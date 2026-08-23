const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// بيانات وهمية متكاملة للربط
let botConfig = {
    clientId: '154057416353677415',
    clientSecret: '••••••••••••',
    callbackUrl: 'https://discord-bot-dashboard-v2-1-bihd.onrender.com/login/api',
    admin: '8725365706673784',
    token: '••••••••••••',
    prefix: '-',
    port: '1337',
    theme: 'default.css'
};

let pluginsList = [
    { id: 'ban', name: 'Ban', dev: 'Mohammed Alhajri', desc: 'Bans a user from the server.', usage: '-ban {@user}', aliases: 'خلخو', enabled: true },
    { id: 'clear', name: 'clear', dev: 'Mohammed Alhajri', desc: 'Clears messages from a channel.', usage: '-clear {amount}', aliases: 'None', enabled: true },
    { id: 'coin', name: 'coin', dev: 'Mohammed Alhajri', desc: 'Simple coin flip command', usage: '-coin', aliases: 'None', enabled: true },
    { id: 'kick', name: 'kick', dev: 'Mohammed Alhajri', desc: 'Kicks a user from the server.', usage: '-kick {@user}', aliases: 'None', enabled: true },
    { id: 'ping', name: 'ping', dev: 'Mohammed Alhajri', desc: 'Ping / Pong!', usage: '-ping', aliases: 'None', enabled: true }
];

// دالة الهيكل العام الداكن (Dark Theme UI)
function renderLayout(title, content) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - OS | System</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body { background-color: #0b0f19; color: #94a3b8; display: flex; flex-direction: column; min-height: 100vh; }
            .navbar { background: #111827; padding: 15px 20px; border-bottom: 1px solid #1f2937; display: flex; align-items: center; justify-content: space-between; }
            .sidebar-toggle { color: #fff; font-size: 20px; cursor: pointer; }
            .user-profile { display: flex; align-items: center; gap: 10px; color: #fff; }
            .user-avatar { width: 35px; height: 35px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; }
            .layout { display: flex; flex: 1; }
            .sidebar { width: 240px; background: #111827; border-right: 1px solid #1f2937; padding: 20px 0; }
            .sidebar a { display: flex; align-items: center; gap: 12px; padding: 12px 25px; color: #94a3b8; text-decoration: none; font-weight: 500; transition: 0.2s; }
            .sidebar a:hover, .sidebar a.active { background: #1f2937; color: #38bdf8; border-left: 4px solid #38bdf8; }
            .main-content { flex: 1; padding: 25px; background: #0b0f19; overflow-y: auto; }
            .card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .card-header { font-size: 18px; font-weight: bold; color: #f3f4f6; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .stat-box { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 15px; text-align: center; }
            .stat-value { font-size: 22px; font-weight: bold; color: #f3f4f6; margin-top: 5px; }
            .btn { background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
            .btn-danger { background: #dc2626; }
            .btn-success { background: #16a34a; }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; margin-bottom: 6px; color: #d1d5db; font-size: 14px; }
            .form-control { width: 100%; padding: 10px; background: #1f2937; border: 1px solid #374151; border-radius: 6px; color: #fff; outline: none; }
            .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #374151; transition: .4s; border-radius: 22px; }
            .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider { background-color: #2563eb; }
            input:checked + .slider:before { transform: translateX(22px); }
            .footer { text-align: center; padding: 20px; background: #111827; border-top: 1px solid #1f2937; font-size: 13px; color: #6b7280; }
            @media (max-width: 768px) { .layout { flex-direction: column; } .sidebar { width: 100%; } }
        </style>
    </head>
    <body>
        <div class="navbar">
            <div class="sidebar-toggle"><i class="fas fa-bars"></i></div>
            <div class="user-profile">
                <div class="user-avatar">N</div>
                <span>nfyp_ <small style="color:#6b7280">Admin</small></span>
            </div>
        </div>
        <div class="layout">
            <div class="sidebar">
                <a href="/dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                <a href="/plugins"><i class="fas fa-puzzle-piece"></i> Plugins</a>
                <a href="/guilds"><i class="fas fa-server"></i> Guilds</a>
                <a href="/support"><i class="fas fa-headset"></i> Support</a>
                <a href="/settings"><i class="fas fa-cog"></i> Settings</a>
            </div>
            <div class="main-content">
                ${content}
            </div>
        </div>
        <div class="footer">
            Discord BOT Dashboard V2 - Mohammed Alhajri
        </div>
    </body>
    </html>
    `;
}

// 1. Landing / Login Page
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome - OS | System</title>
        <style>
            body { background: #0d131f; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .login-card { background: #1e293b; padding: 40px; border-radius: 12px; text-align: center; width: 320px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .avatar { width: 80px; height: 80px; border-radius: 50%; background: #475569; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
            .btn-login { display: block; margin-top: 25px; padding: 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="login-card">
            <h2>Welcome:</h2>
            <h1 style="color: #38bdf8; margin-bottom: 15px;">OS | System</h1>
            <div class="avatar">⚙️</div>
            <p style="font-size: 13px; color: #94a3b8;">Discord BOT Dashboard<br>Created by: Mohammed Alhajri</p>
            <a href="/dashboard" class="btn-login">Login »</a>
        </div>
    </body>
    </html>
    `);
});

// 2. Dashboard Page
app.get('/dashboard', (req, res) => {
    const content = `
        <h2 style="color:#fff; margin-bottom: 5px;">Welcome, nfyp_</h2>
        <p style="margin-bottom: 20px;">Here's what's happening with <b>OS | System</b> today.</p>
        
        <div class="grid">
            <div class="stat-box"><div>Server Count</div><div class="stat-value">📊 1</div></div>
            <div class="stat-box"><div>User Count</div><div class="stat-value">👥 9</div></div>
            <div class="stat-box"><div>API Latency</div><div class="stat-value">⚡ 94ms</div></div>
            <div class="stat-box"><div>Prefix</div><div class="stat-value">📢 -</div></div>
        </div>

        <div class="card">
            <div class="card-header"><i class="fas fa-bullhorn"></i> Dashboard</div>
            <p>Welcome to Discord BOT Dashboard V2, this is an early version of the final product! Please report any issues you find!</p>
            <p style="margin-top:10px;"><b>Version:</b> 3.0</p>
        </div>

        <div class="card">
            <div class="card-header"><i class="fas fa-info-circle"></i> OS | System - Details</div>
            <p><b>Username:</b> OS | System#3523</p>
            <p><b>Client ID:</b> 154057416353677415</p>
            <p><b>Joined:</b> Saturday, August 22nd, 2026</p>
        </div>
    `;
    res.send(renderLayout('Dashboard', content));
});

// 3. Plugins Page
app.get('/plugins', (req, res) => {
    let pluginsHTML = pluginsList.map(p => `
        <div class="card" style="margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>🛠️ ${p.name}</h3>
                <label class="switch">
                    <input type="checkbox" ${p.enabled ? 'checked' : ''} onchange="fetch('/api/plugins/toggle/${p.id}', {method:'POST'})">
                    <span class="slider"></span>
                </label>
            </div>
            <p style="margin: 8px 0; font-size: 14px;"><b>Developer:</b> ${p.dev}</p>
            <p style="margin: 8px 0; font-size: 14px;"><b>Description:</b> ${p.desc}</p>
            <p style="margin: 8px 0; font-size: 14px;"><b>Usage:</b> <code>${p.usage}</code></p>
            <p style="margin: 8px 0; font-size: 14px;"><b>Aliases:</b> <span style="color:#38bdf8">${p.aliases}</span></p>
            <div style="margin-top:10px;">
                <button onclick="editAlias('${p.id}', '${p.aliases}')" class="btn"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="fetch('/api/plugins/remove/${p.id}', {method:'POST'}).then(()=>location.reload())" class="btn btn-danger"><i class="fas fa-trash"></i> Remove</button>
            </div>
        </div>
    `).join('');

    const content = `
        <h2 style="color:#fff; margin-bottom: 10px;">Plugins</h2>
        <p style="margin-bottom: 20px;">Configure and enable plugins that you would like to use!</p>
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

// API Routes handling Plugin changes
app.post('/api/plugins/toggle/:id', (req, res) => {
    const p = pluginsList.find(x => x.id === req.params.id);
    if(p) p.enabled = !p.enabled;
    res.json({ success: true });
});

app.post('/api/plugins/alias/:id', (req, res) => {
    const p = pluginsList.find(x => x.id === req.params.id);
    if(p) p.aliases = req.body.alias || 'None';
    res.json({ success: true });
});

app.post('/api/plugins/remove/:id', (req, res) => {
    pluginsList = pluginsList.filter(x => x.id !== req.params.id);
    res.json({ success: true });
});

// 4. Guilds Page
app.get('/guilds', (req, res) => {
    const content = `
        <h2 style="color:#fff; margin-bottom: 10px;">Guilds</h2>
        <p style="margin-bottom: 20px;">See all the Guilds (Servers) that your BOT is in.</p>
        <div class="card">
            <div style="display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="width:50px; height:50px; border-radius:50%; background:#374151; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff;">O</div>
                    <div>
                        <h3 style="color:#fff;">Oscorp</h3>
                        <p style="font-size:13px;">Member Count: 9</p>
                    </div>
                </div>
                <button class="btn btn-danger" onclick="alert('Left Guild')">Leave Guild</button>
            </div>
        </div>
    `;
    res.send(renderLayout('Guilds', content));
});

// 5. Support Page
app.get('/support', (req, res) => {
    const content = `
        <h2 style="color:#fff; margin-bottom: 10px;">Support</h2>
        <p style="margin-bottom: 20px;">Contact us using any of the following methods!</p>
        <div class="card">
            <div class="card-header"><i class="fas fa-envelope"></i> Contact</div>
            <p style="margin-bottom:8px;"><b>Email:</b> mail@MohammedAlhajri-dev.com</p>
            <p style="margin-bottom:8px;"><b>Twitter:</b> @i661y</p>
            <p style="margin-bottom:8px;"><b>Instagram:</b> @i661y</p>
            <p style="margin-bottom:8px;"><b>Discord Server:</b> <a href="#" class="btn" style="padding:2px 8px; font-size:12px;">Invite</a></p>
            <p style="margin-bottom:8px;"><b>Discord:</b> Mohammed Alhajri</p>
        </div>
    `;
    res.send(renderLayout('Support', content));
});

// 6. Settings Page
app.get('/settings', (req, res) => {
    const content = `
        <h2 style="color:#fff; margin-bottom: 10px;">Settings</h2>
        <p style="margin-bottom: 20px;">Customize your BOT and update settings within the dashboard!</p>
        <form method="POST" action="/settings/save" class="card">
            <div class="card-header"><i class="fas fa-sliders-h"></i> Config Settings</div>
            <div class="form-group">
                <label>Client ID:</label>
                <input type="text" name="clientId" class="form-control" value="${botConfig.clientId}">
            </div>
            <div class="form-group">
                <label>Prefix:</label>
                <input type="text" name="prefix" class="form-control" value="${botConfig.prefix}">
            </div>
            <div class="form-group">
                <label>Port:</label>
                <input type="text" name="port" class="form-control" value="${botConfig.port}">
            </div>
            <button type="submit" class="btn btn-success">Save</button>
        </form>
    `;
    res.send(renderLayout('Settings', content));
});

app.post('/settings/save', (req, res) => {
    botConfig = { ...botConfig, ...req.body };
    res.redirect('/settings');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
