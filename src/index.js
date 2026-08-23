const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startTime = Date.now();

let botConfig = {
    clientId: '154057416353677415',
    prefix: '-',
    port: '1337'
};

let pluginsList = [
    { id: 'ban', name: 'Ban', dev: 'Mohammed Alhajri', desc: 'Bans a user from the server.', usage: '-ban {@user}', aliases: 'خلخو', enabled: true },
    { id: 'clear', name: 'clear', dev: 'Mohammed Alhajri', desc: 'Clears messages from a channel.', usage: '-clear {amount}', aliases: 'None', enabled: true },
    { id: 'coin', name: 'coin', dev: 'Mohammed Alhajri', desc: 'Simple coin flip command', usage: '-coin', aliases: 'None', enabled: true },
    { id: 'kick', name: 'kick', dev: 'Mohammed Alhajri', desc: 'Kicks a user from the server.', usage: '-kick {@user}', aliases: 'None', enabled: true },
    { id: 'ping', name: 'ping', dev: 'Mohammed Alhajri', desc: 'Ping / Pong!', usage: '-ping', aliases: 'None', enabled: true }
];

function getUptime() {
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

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
            
            /* Banner GIF Zikr */
            .dhikr-banner { background: linear-gradient(90deg, #1e1b4b, #312e81, #1e1b4b); color: #facc15; text-align: center; padding: 10px; font-weight: bold; font-size: 15px; border-bottom: 1px solid #4338ca; letter-spacing: 0.5px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
            
            .navbar { background: #111827; padding: 15px 20px; border-bottom: 1px solid #1f2937; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 100; }
            .sidebar-toggle { color: #fff; font-size: 22px; cursor: pointer; padding: 5px 10px; background: #1f2937; border-radius: 6px; }
            .user-profile { display: flex; align-items: center; gap: 10px; color: #fff; }
            .user-avatar { width: 35px; height: 35px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: bold; }
            
            .layout { display: flex; flex: 1; position: relative; }
            .sidebar { width: 240px; background: #111827; border-right: 1px solid #1f2937; padding: 20px 0; transition: all 0.3s ease; }
            .sidebar a { display: flex; align-items: center; gap: 12px; padding: 12px 25px; color: #94a3b8; text-decoration: none; font-weight: 500; transition: 0.2s; }
            .sidebar a:hover, .sidebar a.active { background: #1f2937; color: #38bdf8; border-left: 4px solid #38bdf8; }
            
            .main-content { flex: 1; padding: 25px; background: #0b0f19; overflow-y: auto; }
            .card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .card-header { font-size: 18px; font-weight: bold; color: #f3f4f6; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .stat-box { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 15px; text-align: center; }
            .stat-value { font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 5px; }
            
            .btn { background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
            .btn-danger { background: #dc2626; }
            .btn-success { background: #16a34a; }
            
            .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #374151; transition: .4s; border-radius: 22px; }
            .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider { background-color: #2563eb; }
            input:checked + .slider:before { transform: translateX(22px); }
            
            .footer { text-align: center; padding: 20px; background: #111827; border-top: 1px solid #1f2937; font-size: 13px; color: #6b7280; }

            /* Mobile Sidebar Hidden by default */
            @media (max-width: 768px) {
                .layout { flex-direction: column; }
                .sidebar { display: none; width: 100%; border-right: none; border-bottom: 1px solid #1f2937; }
                .sidebar.active { display: block; }
            }
        </style>
    </head>
    <body>
        <div class="dhikr-banner">
            ✨ ✨
        </div>

        <div class="navbar">
            <div class="sidebar-toggle" onclick="toggleSidebar()"><i class="fas fa-bars"></i></div>
            <div class="user-profile">
                <div class="user-avatar">N</div>
                <span>nfyp_ <small style="color:#6b7280">Admin</small></span>
            </div>
        </div>

        <div class="layout">
            <div class="sidebar" id="sidebar">
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

        <script>
            function toggleSidebar() {
                const sb = document.getElementById('sidebar');
                sb.classList.toggle('active');
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
            <div class="card-header"><i class="fas fa-server" style="color:#38bdf8"></i> Active Server: Oscorp (OSCORP RP)</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; margin-top:10px;">
                <p><b>Guild ID:</b> 1198301284910283</p>
                <p><b>Owner:</b> nfyp_</p>
                <p><b>Channels:</b> 14</p>
                <p><b>Roles:</b> 8</p>
                <p><b>Region:</b> Dubai / Middle East</p>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><i class="fas fa-bullhorn"></i> Announcement</div>
            <p>Welcome to Discord BOT Dashboard V2! Toggle button and uptime tracker are now live.</p>
            <p style="margin-top:10px;"><b>Version:</b> 3.5</p>
        </div>
    `;
    res.send(renderLayout('Dashboard', content));
});

app.get('/plugins', (req, res) => {
    let pluginsHTML = pluginsList.map(p => `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>🛠️ ${p.name}</h3>
                <label class="switch">
                    <input type="checkbox" ${p.enabled ? 'checked' : ''} onchange="fetch('/api/plugins/toggle/${p.id}', {method:'POST'})">
                    <span class="slider"></span>
                </label>
            </div>
            <p style="margin: 8px 0; font-size: 14px;"><b>Developer:</b> ${p.dev}</p>
            <p style="margin: 8px 0; font-size: 14px;"><b>Description:</b> ${p.desc}</p>
            <p style="margin: 8px 0; font-size: 14px;"><b>Aliases:</b> <span style="color:#38bdf8">${p.aliases}</span></p>
            <div style="margin-top:10px;">
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

app.get('/guilds', (req, res) => {
    res.send(renderLayout('Guilds', `
        <h2 style="color:#fff; margin-bottom: 10px;">Guilds</h2>
        <div class="card">
            <h3>Oscorp</h3>
            <p>Members: 9</p>
        </div>
    `));
});

app.get('/support', (req, res) => {
    res.send(renderLayout('Support', `
        <h2 style="color:#fff; margin-bottom: 10px;">Support</h2>
        <div class="card"><p>Contact: Mohammed Alhajri</p></div>
    `));
});

app.get('/settings', (req, res) => {
    res.send(renderLayout('Settings', `
        <h2 style="color:#fff; margin-bottom: 10px;">Settings</h2>
        <div class="card"><p>Prefix: ${botConfig.prefix}</p></div>
    `));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
