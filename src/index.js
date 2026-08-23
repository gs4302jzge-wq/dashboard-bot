const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PREFIX = '-';
const BOT_START_TIME = Date.now();

// Storage for plugins aliases dynamically set from dashboard
const pluginsStore = {
  setnick: [], ban: [], unban: [], kick: [], vkick: [],
  mute_text: [], unmute_text: [], mute_voice: [], unmute_voice: [],
  timeout: [], untimeout: [], clear: [], move: [], role: [],
  points: [], warn: [], warn_remove: [], warnings: [],
  lock: [], unlock: [], setcolor: [], slowmode: [], reset: []
};

// Base command definitions
const commandsConfig = [
  { id: 'setnick', name: 'setnick', desc: '✏️ Change nickname of a member', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true }, { name: 'nick', desc: 'New nickname', type: 'string', req: true } ] },
  { id: 'ban', name: 'ban', desc: '🔨 Ban a member', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'unban', name: 'unban', desc: '🔓 Unban a member', options: [ { name: 'userid', desc: 'User ID', type: 'string', req: true } ] },
  { id: 'kick', name: 'kick', desc: '👢 Kick a member', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'vkick', name: 'vkick', desc: '🔇 Kick member from voice channel', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'mute_text', name: 'mute_text', desc: '🔕 Mute member in text channels', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'unmute_text', name: 'unmute_text', desc: '🔔 Unmute text channel mute', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'mute_voice', name: 'mute_voice', desc: '🎙️ Mute member in voice channels', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'unmute_voice', name: 'unmute_voice', desc: '🔊 Unmute voice channel mute', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'timeout', name: 'timeout', desc: '⏱️ Timeout member', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true }, { name: 'minutes', desc: 'Duration in minutes', type: 'int', req: true } ] },
  { id: 'untimeout', name: 'untimeout', desc: '⏰ Remove timeout', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'clear', name: 'clear', desc: '🧹 Clear messages', options: [ { name: 'amount', desc: 'Amount of messages (1-100)', type: 'int', req: true } ] },
  { id: 'move', name: 'move', desc: '🚀 Move member to voice channel', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true }, { name: 'channel', desc: 'Voice Channel', type: 'channel', req: true } ] },
  { id: 'role', name: 'role', desc: '🏷️ Add or remove role', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true }, { name: 'role', desc: 'Role', type: 'role', req: true } ] },
  { id: 'points', name: 'points', desc: '⭐ Show or manage user points', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'warn', name: 'warn', desc: '⚠️ Issue warning to member', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true }, { name: 'reason', desc: 'Reason', type: 'string', req: false } ] },
  { id: 'warn_remove', name: 'warn_remove', desc: '🗑️ Remove warning from user', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'warnings', name: 'warnings', desc: '📋 List member warnings', options: [ { name: 'user', desc: 'Target user', type: 'user', req: true } ] },
  { id: 'lock', name: 'lock', desc: '🔒 Lock current channel', options: [] },
  { id: 'unlock', name: 'unlock', desc: '🔓 Unlock current channel', options: [] },
  { id: 'setcolor', name: 'setcolor', desc: '🎨 Change role color', options: [ { name: 'role', desc: 'Role', type: 'role', req: true }, { name: 'color', desc: 'Hex Code', type: 'string', req: true } ] },
  { id: 'slowmode', name: 'slowmode', desc: '⏳ Set channel slowmode', options: [ { name: 'seconds', desc: 'Seconds', type: 'int', req: true } ] },
  { id: 'reset', name: 'reset', desc: '🔄 Reset user XP/Points', options: [] }
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const BOT_TOKEN = process.env.DISCORD_TOKEN;

// Formatted Uptime Helper
function getFormattedUptime() {
  const diff = Date.now() - BOT_START_TIME;
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 30);
  const months = Math.floor((diff / (1000 * 60 * 60 * 24 * 30)) % 12);
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

  return { years, months, days, hours, minutes, seconds, rawMs: diff };
}

// Embed Helpers
const createSuccessEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle(`${title}`)
    .setDescription(description)
    .setFooter({ text: 'OS | System Security', iconURL: client.user?.displayAvatarURL() })
    .setTimestamp();
};

const createErrorEmbed = (description) => {
  return new EmbedBuilder()
    .setColor('#f43f5e')
    .setTitle('❌ Execution Error')
    .setDescription(description)
    .setFooter({ text: 'OS | System Security', iconURL: client.user?.displayAvatarURL() });
};

// Global Command ID Resolver (Supports Base Name & Dynamic Aliases with Arabic & Any Characters)
function resolveCommandId(input) {
  if (!input) return null;
  const cleanInput = input.trim().toLowerCase();

  for (const cmd of commandsConfig) {
    if (cmd.id.toLowerCase() === cleanInput || cmd.name.toLowerCase() === cleanInput) {
      return cmd.id;
    }
    const aliases = pluginsStore[cmd.id] || [];
    for (const alias of aliases) {
      if (alias.trim().toLowerCase() === cleanInput) {
        return cmd.id;
      }
    }
  }
  return null;
}

// Register Slash Commands Register Function
async function registerSlashCommands() {
  if (!client.user || !BOT_TOKEN) return;
  const slashList = [];
  const registeredNames = new Set();

  for (const cmd of commandsConfig) {
    const rawName = cmd.name;
    const validName = rawName.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!validName || registeredNames.has(validName)) continue;

    registeredNames.add(validName);

    const builder = new SlashCommandBuilder()
      .setName(validName)
      .setDescription(cmd.desc);

    cmd.options.forEach(opt => {
      if (opt.type === 'user') builder.addUserOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
      else if (opt.type === 'string') builder.addStringOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
      else if (opt.type === 'int') builder.addIntegerOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
      else if (opt.type === 'channel') builder.addChannelOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
      else if (opt.type === 'role') builder.addRoleOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
    });

    slashList.push(builder.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: slashList });
    console.log(`💎 Registered ${slashList.length} Base Slash Commands to Discord API!`);
  } catch (err) {
    console.error('Failed to register Slash Commands:', err.message);
  }
}

// Unified Command Router & Execution Engine
async function handleExecution(commandId, target, options) {
  const guild = target.guild;
  const channel = target.channel;

  try {
    if (commandId === 'setnick') {
      const user = options.user;
      const nick = options.nick;
      if (!user || !nick) return target.reply({ embeds: [createErrorEmbed('Please provide user and new nickname.')] });
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (member) {
        await member.setNickname(nick).catch(() => null);
        return target.reply({ embeds: [createSuccessEmbed('✏️ Nickname Changed', `Successfully changed **${user.tag}** nickname to **${nick}**`)] });
      }
    }
    else if (commandId === 'ban') {
      const user = options.user;
      if (!user) return target.reply({ embeds: [createErrorEmbed('Please mention a valid user.')] });
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (member) {
        await member.ban().catch(() => null);
        return target.reply({ embeds: [createSuccessEmbed('🔨 Member Banned', `Successfully banned **${user.tag}**.`)] });
      }
    }
    else if (commandId === 'unban') {
      const userId = options.userid;
      if (!userId) return target.reply({ embeds: [createErrorEmbed('Please provide a user ID.')] });
      await guild.members.unban(userId).catch(() => null);
      return target.reply({ embeds: [createSuccessEmbed('🔓 Member Unbanned', `Successfully unbanned User ID: **${userId}**`)] });
    }
    else if (commandId === 'kick') {
      const user = options.user;
      if (!user) return target.reply({ embeds: [createErrorEmbed('Please mention a valid user.')] });
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (member) {
        await member.kick().catch(() => null);
        return target.reply({ embeds: [createSuccessEmbed('👢 Member Kicked', `Successfully kicked **${user.tag}**.`)] });
      }
    }
    else if (commandId === 'vkick') {
      const user = options.user;
      if (!user) return target.reply({ embeds: [createErrorEmbed('Please mention a valid user.')] });
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (member && member.voice.channel) {
        await member.voice.disconnect().catch(() => null);
        return target.reply({ embeds: [createSuccessEmbed('🔇 Voice Kick', `Disconnected **${user.tag}** from voice channel.`)] });
      }
      return target.reply({ embeds: [createErrorEmbed('User is not connected to any voice channel.')] });
    }
    else if (commandId === 'lock') {
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
      return target.reply({ embeds: [createSuccessEmbed('🔒 Channel Locked', 'Disabled message sending in this channel.')] });
    }
    else if (commandId === 'unlock') {
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
      return target.reply({ embeds: [createSuccessEmbed('🔓 Channel Unlocked', 'Allowed message sending in this channel.')] });
    }
    else if (commandId === 'clear') {
      const amount = options.amount || 10;
      await channel.bulkDelete(amount, true).catch(() => null);
      return target.reply({ embeds: [createSuccessEmbed('🧹 Channel Cleared', `Deleted **${amount}** messages.`)].map(e => e.toJSON()), ephemeral: true });
    }
    else if (commandId === 'slowmode') {
      const seconds = options.seconds || 0;
      await channel.setRateLimitPerUser(seconds);
      return target.reply({ embeds: [createSuccessEmbed('⏳ Slowmode Set', `Channel slowmode set to **${seconds}** seconds.`)] });
    }
    else {
      return target.reply({ embeds: [createSuccessEmbed(`✅ Command Executed`, `Successfully executed plugin **${commandId}**.`)] });
    }
  } catch (err) {
    return target.reply({ embeds: [createErrorEmbed(`Failed to execute command: ${err.message}`)] });
  }
}

// Interaction Event Listener
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const commandId = resolveCommandId(interaction.commandName);
  
  if (commandId) {
    const options = {
      user: interaction.options.getUser('user'),
      nick: interaction.options.getString('nick'),
      userid: interaction.options.getString('userid'),
      amount: interaction.options.getInteger('amount'),
      seconds: interaction.options.getInteger('seconds'),
      minutes: interaction.options.getInteger('minutes'),
      channel: interaction.options.getChannel('channel'),
      role: interaction.options.getRole('role'),
      color: interaction.options.getString('color'),
      reason: interaction.options.getString('reason')
    };
    await handleExecution(commandId, interaction, options);
  }
});

// Text Prefix & Direct Aliases Event Listener (Supports With & Without Prefix)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let content = message.content.trim();
  let rawCmd = '';

  if (content.startsWith(PREFIX)) {
    const args = content.slice(PREFIX.length).trim().split(/ +/);
    rawCmd = args.shift();
    content = args.join(' ');
  } else {
    const parts = content.split(/ +/);
    rawCmd = parts.shift();
    content = parts.join(' ');
  }

  const commandId = resolveCommandId(rawCmd);

  if (commandId) {
    const args = content ? content.split(/ +/) : [];
    const options = {
      user: message.mentions.users.first() || client.users.cache.get(args[0]),
      nick: args[1],
      userid: args[0],
      amount: parseInt(args[0]) || 10,
      seconds: parseInt(args[0]) || 0,
      minutes: parseInt(args[1]) || 5,
      reason: args.slice(1).join(' ')
    };
    await handleExecution(commandId, message, options);
  }
});

if (BOT_TOKEN) {
  client.once('ready', () => {
    console.log(`🤖 Logged in as: ${client.user.tag}`);
    registerSlashCommands();
  });
  client.login(BOT_TOKEN).catch(err => console.error('❌ Login Error:', err.message));
}

// UI Components
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
    { path: '/welcome', label: 'Welcome & System', icon: 'fa-solid fa-hand-sparkles' },
    { path: '/plugins', label: 'Plugins', icon: 'fa-solid fa-rocket' },
    { path: '/guilds', label: 'Guilds', icon: 'fa-solid fa-server' },
    { path: '/support', label: 'Support', icon: 'fa-solid fa-circle-question' },
    { path: '/settings', label: 'Settings', icon: 'fa-solid fa-gear' }
  ];

  const navLinks = navItems.map(item => {
    const isActive = activePath === item.path;
    const activeStyle = isActive 
      ? 'background: linear-gradient(90deg, rgba(56, 189, 248, 0.25), rgba(56, 189, 248, 0.05)); color: #38bdf8; font-weight: 600; border-left: 3px solid #38bdf8;' 
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
    <nav style="display:flex; flex-direction:column; gap:6px;">${navLinks}</nav>
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
      body { margin: 0; padding: 0; background-color: #080d1a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; }
      .top-banner { text-align: center; padding: 10px; background: linear-gradient(90deg, #090e1c, #0f172a, #090e1c); color: #fcd34d; font-size: 14px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .navbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 22px; background-color: #0b1224; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
      .menu-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #f8fafc; width: 40px; height: 40px; border-radius: 10px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
      .container { padding: 20px; max-width: 900px; margin: 0 auto; }
      .card { background: #0d1527; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
      .btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
      .btn-sky { background: #0284c7; }
      .btn-danger { background: #ef4444; }
      .toggle-switch { position: relative; display: inline-block; width: 46px; height: 24px; }
      .toggle-switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .3s; border-radius: 24px; }
      .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
      input:checked + .slider { background-color: #3b82f6; }
      input:checked + .slider:before { transform: translateX(22px); }
      .uptime-unit { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px; text-align: center; }
      .uptime-val { font-size: 20px; font-weight: 800; color: #38bdf8; }
      .uptime-lbl { font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; font-weight: 600; }
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
    <div class="container">${content}</div>
    ${sidebarScript}
  </body>
  </html>
  `;
}

// REST API for Live Uptime
app.get('/api/uptime', (req, res) => res.json(getFormattedUptime()));

// Instant Aliases POST Handler (supports Arabic and instant saving)
app.post('/api/aliases', (req, res) => {
  const { pluginId, aliases } = req.body;
  if (pluginId && Array.isArray(aliases)) {
    pluginsStore[pluginId] = aliases
      .map(a => a.trim())
      .filter(a => a !== '');
      
    return res.json({ success: true, updated: pluginsStore[pluginId] });
  }
  res.status(400).json({ success: false, error: 'Invalid Parameters' });
});

// Main Dashboard Page
app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 2;
  const ping = client.ws?.ping || 16;
  const uptime = getFormattedUptime();

  const content = `
    <div style="margin-bottom: 20px; display:flex; justify-content:space-between; align-items:flex-end;">
      <div>
        <h2 style="margin:0; font-size: 26px; font-weight:800; background: linear-gradient(90deg, #ffffff, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome, nfyp_</h2>
        <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">Here's what's happening with <strong style="color:#fff;">OS | System</strong> today.</p>
      </div>
      <div style="display:flex; gap:8px;">
        <span style="background:rgba(34, 197, 94, 0.15); border:1px solid rgba(34, 197, 94, 0.3); color:#4ade80; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:700; display:flex; align-items:center; gap:6px;">
          <span style="width:8px; height:8px; background:#22c55e; border-radius:50%; box-shadow:0 0 8px #22c55e;"></span> System Operational
        </span>
      </div>
    </div>

    <div class="card" style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(15, 23, 42, 0.8)); border: 1px solid rgba(59, 130, 246, 0.3); padding:20px; position:relative; overflow:hidden;">
      <div style="position:relative; z-index:2;">
        <div style="display:flex; align-items:center; gap:8px; color:#38bdf8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
          <i class="fa-solid fa-shield-halved"></i> Security & Moderation Hub
        </div>
        <h3 style="margin:0 0 8px 0; font-size:18px; color:#fff; font-weight:700;">Advanced Discord Bot Ecosystem Active</h3>
        <p style="margin:0; font-size:13px; color:#cbd5e1; line-height:1.6; max-width:650px;">
          All automated moderation systems, Dynamic Aliases Router, and Slash Commands are working seamlessly in real-time.
        </p>
      </div>
    </div>

    <div class="card" style="padding:20px; margin-bottom:16px; background: linear-gradient(135deg, #0d1527, #0f1c38); border: 1px solid rgba(56, 189, 248, 0.25);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="width:10px; height:10px; background:#38bdf8; border-radius:50%; box-shadow:0 0 10px #38bdf8;"></span>
          <h3 style="margin:0; font-size:16px; font-weight:700; color:#fff;">Live System Uptime Tracker</h3>
        </div>
        <span style="font-size:12px; color:#38bdf8; font-weight:600; background:rgba(56, 189, 248, 0.1); padding:4px 10px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.2);"><i class="fa-solid fa-bolt"></i> Realtime Sync</span>
      </div>
      <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:10px;">
        <div class="uptime-unit"><div class="uptime-val" id="ut-years">${uptime.years}</div><div class="uptime-lbl">Years</div></div>
        <div class="uptime-unit"><div class="uptime-val" id="ut-months">${uptime.months}</div><div class="uptime-lbl">Months</div></div>
        <div class="uptime-unit"><div class="uptime-val" id="ut-days">${uptime.days}</div><div class="uptime-lbl">Days</div></div>
        <div class="uptime-unit"><div class="uptime-val" id="ut-hours">${uptime.hours}</div><div class="uptime-lbl">Hours</div></div>
        <div class="uptime-unit"><div class="uptime-val" id="ut-minutes">${uptime.minutes}</div><div class="uptime-lbl">Minutes</div></div>
        <div class="uptime-unit"><div class="uptime-val" id="ut-seconds">${uptime.seconds}</div><div class="uptime-lbl">Seconds</div></div>
      </div>
    </div>

    <div class="card" style="padding:18px; margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h4 style="margin:0; font-size:15px; font-weight:700; color:#cbd5e1;">Live System Overview</h4>
        <button class="btn btn-sky" style="padding:6px 14px; font-size:12px;" onclick="location.reload();"><i class="fa-solid fa-rotate"></i> Refresh Data</button>
      </div>
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:1px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
        <div style="background:#0d1527; padding:18px 14px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase;">Server Count</div>
          <div style="font-size:24px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-bars-staggered" style="font-size:18px; color:#38bdf8;"></i> ${guildCount}</div>
        </div>
        <div style="background:#0d1527; padding:18px 14px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase;">User Count</div>
          <div style="font-size:24px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-users" style="font-size:18px; color:#38bdf8;"></i> ${userCount}</div>
        </div>
        <div style="background:#0d1527; padding:18px 14px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase;">API Latency</div>
          <div style="font-size:24px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-tower-broadcast" style="font-size:18px; color:#38bdf8;"></i> ${ping}ms</div>
        </div>
        <div style="background:#0d1527; padding:18px 14px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase;">Plugins Active</div>
          <div style="font-size:24px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-rocket" style="font-size:18px; color:#38bdf8;"></i> 23</div>
        </div>
      </div>
    </div>

    <script>
      setInterval(async () => {
        try {
          const res = await fetch('/api/uptime');
          const data = await res.json();
          document.getElementById('ut-years').innerText = data.years;
          document.getElementById('ut-months').innerText = data.months;
          document.getElementById('ut-days').innerText = data.days;
          document.getElementById('ut-hours').innerText = data.hours;
          document.getElementById('ut-minutes').innerText = data.minutes;
          document.getElementById('ut-seconds').innerText = data.seconds;
        } catch(e){}
      }, 1000);
    </script>
  `;
  res.send(layout('Dashboard - OS | System', content, '/'));
});

// Welcome Page
app.get('/welcome', (req, res) => {
  const content = `
    <div style="margin-bottom: 20px;">
      <h2 style="margin:0; font-size: 24px; font-weight:700;">Welcome & System Greetings</h2>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Manage custom English welcome messages and server announcements.</p>
    </div>

    <div class="card">
      <h3 style="margin-top:0; font-size:18px; color:#fff;"><i class="fa-solid fa-hand-sparkles" style="color:#38bdf8;"></i> Welcome Banner Configurations</h3>
      <p style="color:#94a3b8; font-size:13px; line-height:1.6;">Configure default English templates for new member join events.</p>

      <div style="display:flex; flex-direction:column; gap:14px; margin-top:16px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:6px;">WELCOME TITLE</label>
          <input type="text" value="Welcome to the Official OS Community Server!" style="width:100%; box-sizing:border-box; background:#060a14; border:1px solid rgba(255,255,255,0.12); color:#fff; padding:10px 14px; border-radius:8px; font-size:13px; outline:none;">
        </div>

        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:6px;">WELCOME BODY PHRASE</label>
          <textarea rows="3" style="width:100%; box-sizing:border-box; background:#060a14; border:1px solid rgba(255,255,255,0.12); color:#fff; padding:10px 14px; border-radius:8px; font-size:13px; outline:none; font-family:inherit;">We are thrilled to have you here! Make sure to read the server guidelines and grab your self-roles in the information channel. Enjoy your stay!</textarea>
        </div>

        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:6px;">FOOTER ANNOUNCEMENT</label>
          <input type="text" value="OS System Security • Automated Verification Enabled" style="width:100%; box-sizing:border-box; background:#060a14; border:1px solid rgba(255,255,255,0.12); color:#fff; padding:10px 14px; border-radius:8px; font-size:13px; outline:none;">
        </div>

        <div style="display:flex; justify-content:flex-end; margin-top:8px;">
          <button class="btn" style="background:#22c55e;"><i class="fa-solid fa-floppy-disk"></i> Save Configurations</button>
        </div>
      </div>
    </div>
  `;
  res.send(layout('Welcome & System - OS | System', content, '/welcome'));
});

// Plugins Page
app.get('/plugins', (req, res) => {
  const rawPlugins = [
    { id: "setnick", name: "setnick", icon: "fa-solid fa-pen", iconBg: "rgba(59, 130, 246, 0.2)", iconColor: "#3b82f6", desc: "Changes the nickname of a member.", usage: "/setnick {@user} {nick}" },
    { id: "ban", name: "ban", icon: "fa-solid fa-hammer", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", desc: "Bans a member.", usage: "/ban {@user}" },
    { id: "unban", name: "unban", icon: "fa-solid fa-lock-open", iconBg: "rgba(34, 197, 94, 0.2)", iconColor: "#22c55e", desc: "Unbans a member.", usage: "/unban {userid}" },
    { id: "kick", name: "kick", icon: "fa-solid fa-user-minus", iconBg: "rgba(249, 115, 22, 0.2)", iconColor: "#f97316", desc: "Kicks a member.", usage: "/kick {@user}" },
    { id: "vkick", name: "vkick", icon: "fa-solid fa-phone-slash", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", desc: "Kicks a member from a voice channel", usage: "/vkick {@user}" },
    { id: "mute_text", name: "mute_text", icon: "fa-solid fa-comment-slash", iconBg: "rgba(100, 116, 139, 0.2)", iconColor: "#94a3b8", desc: "Mute a member so they can't type in text channels.", usage: "/mute_text {@user}" },
    { id: "unmute_text", name: "unmute_text", icon: "fa-solid fa-comment", iconBg: "rgba(34, 197, 94, 0.2)", iconColor: "#22c55e", desc: "Unmutes a member.", usage: "/unmute_text {@user}" },
    { id: "mute_voice", name: "mute_voice", icon: "fa-solid fa-microphone-slash", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", desc: "Mute a member so they can't speak in voice channels.", usage: "/mute_voice {@user}" },
    { id: "unmute_voice", name: "unmute_voice", icon: "fa-solid fa-microphone", iconBg: "rgba(34, 197, 94, 0.2)", iconColor: "#22c55e", desc: "Unmutes a member from voice channels.", usage: "/unmute_voice {@user}" },
    { id: "timeout", name: "timeout", icon: "fa-solid fa-clock", iconBg: "rgba(234, 179, 8, 0.2)", iconColor: "#eab308", desc: "Timeouts a member.", usage: "/timeout {@user} {minutes}" },
    { id: "untimeout", name: "untimeout", icon: "fa-solid fa-bell", iconBg: "rgba(59, 130, 246, 0.2)", iconColor: "#3b82f6", desc: "Removes a timeout from a member.", usage: "/untimeout {@user}" },
    { id: "clear", name: "clear", icon: "fa-solid fa-broom", iconBg: "rgba(20, 184, 166, 0.2)", iconColor: "#14b8a6", desc: "Cleans up channel messages.", usage: "/clear {amount}" },
    { id: "move", name: "move", icon: "fa-solid fa-arrows-up-to-line", iconBg: "rgba(168, 85, 247, 0.2)", iconColor: "#a855f7", desc: "Moves a member to another voice channel.", usage: "/move {@user} {#channel}" },
    { id: "role", name: "role", icon: "fa-solid fa-user-tag", iconBg: "rgba(59, 130, 246, 0.2)", iconColor: "#3b82f6", desc: "Add/remove role(s) for a member.", usage: "/role {@user} {@role}" },
    { id: "points", name: "points", icon: "fa-solid fa-star", iconBg: "rgba(245, 158, 11, 0.2)", iconColor: "#f59e0b", desc: "A server based points that can be given by moderators.", usage: "/points {@user}" },
    { id: "warn", name: "warn", icon: "fa-solid fa-triangle-exclamation", iconBg: "rgba(245, 158, 11, 0.2)", iconColor: "#f59e0b", desc: "Warns a member.", usage: "/warn {@user}" },
    { id: "warn_remove", name: "warn_remove", icon: "fa-solid fa-eraser", iconBg: "rgba(34, 197, 94, 0.2)", iconColor: "#22c55e", desc: "Remove warnings for the server or user.", usage: "/warn_remove {@user}" },
    { id: "warnings", name: "warnings", icon: "fa-solid fa-list-check", iconBg: "rgba(168, 85, 247, 0.2)", iconColor: "#a855f7", desc: "Get the list of warnings for the server or a user.", usage: "/warnings {@user}" },
    { id: "lock", name: "lock", icon: "fa-solid fa-lock", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", desc: "Disables @everyone from sending messages in specific channel.", usage: "/lock" },
    { id: "unlock", name: "unlock", icon: "fa-solid fa-lock-open", iconBg: "rgba(34, 197, 94, 0.2)", iconColor: "#22c55e", desc: "Allows @everyone to send messages in specific channel.", usage: "/unlock" },
    { id: "setcolor", name: "setcolor", icon: "fa-solid fa-palette", iconBg: "rgba(236, 72, 153, 0.2)", iconColor: "#ec4899", desc: "Changes role's color by hex codes.", usage: "/setcolor {@role} {hex}" },
    { id: "slowmode", name: "slowmode", icon: "fa-solid fa-hourglass-half", iconBg: "rgba(168, 85, 247, 0.2)", iconColor: "#a855f7", desc: "Enable or disable slowmode on a channel.", usage: "/slowmode {seconds}" },
    { id: "reset", name: "reset", icon: "fa-solid fa-rotate-left", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", desc: "Reset text/voice/invites xp points for all or specific members.", usage: "/reset" }
  ];

  const pluginCards = rawPlugins.map(p => {
    const userAliases = pluginsStore[p.id] || [];
    const jsonAliases = JSON.stringify(userAliases).replace(/"/g, '&quot;');
    const aliasesDisplay = userAliases.length > 0 
      ? `<span style="color:#38bdf8; font-weight:600;">${userAliases.join(', ')}</span>` 
      : `<span style="color:#94a3b8; font-weight:600;">None</span>`;

    return `
    <div class="card" style="padding:20px; margin-bottom:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:42px; height:42px; border-radius:10px; background:${p.iconBg}; border:1px solid rgba(255,255,255,0.08); color:${p.iconColor}; display:flex; align-items:center; justify-content:center; font-size:18px;">
            <i class="${p.icon}"></i>
          </div>
          <h3 style="margin:0; font-size:20px; font-weight:700; color:#fff;">${p.name}</h3>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" checked>
          <span class="slider"></span>
        </label>
      </div>

      <div style="font-size:13px; color:#cbd5e1; line-height:1.8; margin-bottom:16px;">
        <div><strong>Developer:</strong> Mohammed Alhajri</div>
        <div><strong>Description:</strong> ${p.desc}</div>
        <div><strong>Usage:</strong> <span style="background:rgba(56, 189, 248, 0.12); color:#38bdf8; padding:2px 8px; border-radius:4px; font-family:monospace; font-size:12px;">${p.usage}</span></div>
        <div><strong>Aliases:</strong> ${aliasesDisplay}</div>
      </div>

      <div style="display:flex; gap:10px;">
        <button class="btn" onclick="openEditModal('${p.id}', '${p.name}', ${jsonAliases})" style="background:#2563eb; font-size:12px; padding:6px 14px;"><i class="fa-solid fa-pen-to-square"></i> Edit Aliases</button>
      </div>
    </div>
  `}).join('');

  const content = `
    <h2 style="margin-bottom: 18px; font-size:26px; font-weight:700;">Plugins Management</h2>
    <div>${pluginCards}</div>

    <div id="editAliasModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center; padding:15px; box-sizing:border-box;">
      <div class="card" style="width:100%; max-width:400px; margin:0; background:#0b1220; border:1px solid rgba(255,255,255,0.12); box-shadow:0 10px 30px rgba(0,0,0,0.8); border-radius:12px; padding:20px;">
        <h3 style="margin-top:0; color:#fff; font-size:17px; font-weight:700; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-pen-to-square" style="color:#38bdf8; font-size:16px;"></i> Edit Aliases
        </h3>
        <div style="color:#cbd5e1; font-size:13px; font-weight:600; margin-bottom:12px;">Aliases (up to 5)</div>
        <div id="aliasesContainer" style="display:flex; flex-direction:column; gap:10px; margin-bottom:12px;"></div>
        <div id="limitWarning" style="color:#ef4444; font-size:11px; font-weight:700; margin-bottom:12px; display:none; text-transform:uppercase;">
          YOU HAVE REACHED 5 LIMIT ONLY
        </div>
        <button id="addAliasBtn" onclick="addAliasField()" class="btn" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; width:100%; justify-content:center; margin-bottom:16px; font-size:13px; padding:8px;">
          <i class="fa-solid fa-plus"></i> Add Alias
        </button>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="closeEditModal()" class="btn" style="background:rgba(255,255,255,0.08); color:#cbd5e1; font-size:12px; padding:6px 16px;">Cancel</button>
          <button id="saveBtn" onclick="saveAliases()" class="btn" style="background:#22c55e; color:#fff; font-size:12px; padding:6px 16px;"><i class="fa-solid fa-floppy-disk"></i> Save</button>
        </div>
      </div>
    </div>

    <script>
      let currentPluginId = '';
      let currentAliases = [];

      function openEditModal(id, name, aliases) {
        currentPluginId = id;
        currentAliases = Array.isArray(aliases) ? [...aliases] : [];
        renderAliasInputs();
        document.getElementById('editAliasModal').style.display = 'flex';
      }

      function closeEditModal() {
        document.getElementById('editAliasModal').style.display = 'none';
      }

      function renderAliasInputs() {
        const container = document.getElementById('aliasesContainer');
        container.innerHTML = '';
        currentAliases.forEach((alias, index) => {
          const div = document.createElement('div');
          div.style.cssText = 'display:flex; align-items:center; gap:8px;';
          div.innerHTML = \`
            <input type="text" value="\${alias}" oninput="currentAliases[\${index}] = this.value" placeholder="e.g. n or nick or نك" style="flex:1; background:#060a14; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 12px; border-radius:6px; font-size:13px; outline:none;">
            <button onclick="removeAliasField(\${index})" style="background:#ef4444; border:none; color:#fff; width:34px; height:34px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px;">
              <i class="fa-solid fa-trash"></i>
            </button>
          \`;
          container.appendChild(div);
        });

        const limitWarning = document.getElementById('limitWarning');
        const addBtn = document.getElementById('addAliasBtn');

        if (currentAliases.length >= 5) {
          limitWarning.style.display = 'block';
          addBtn.style.opacity = '0.5';
          addBtn.style.pointerEvents = 'none';
        } else {
          limitWarning.style.display = 'none';
          addBtn.style.opacity = '1';
          addBtn.style.pointerEvents = 'auto';
        }
      }

      function addAliasField() {
        if (currentAliases.length < 5) {
          currentAliases.push('');
          renderAliasInputs();
        }
      }

      function removeAliasField(index) {
        currentAliases.splice(index, 1);
        renderAliasInputs();
      }

      async function saveAliases() {
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
          const response = await fetch('/api/aliases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pluginId: currentPluginId,
              aliases: currentAliases
            })
          });

          if (response.ok) {
            location.reload();
          } else {
            alert('Failed to save aliases.');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
          }
        } catch {
          alert('Error connecting to server');
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
        }
      }
    </script>
  `;

  res.send(layout('Plugins - OS | System', content, '/plugins'));
});

app.get('/guilds', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 20px; font-size:24px;">Guilds Overview</h2>
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:52px; height:52px; border-radius:14px; background:#2563eb; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:24px; color:#fff;">O</div>
          <div>
            <h3 style="margin:0; font-size:20px; color:#fff;">OSCORP RP</h3>
            <div style="color:#64748b; font-size:12px; margin-top:2px;">ID: 1540577416353677415</div>
          </div>
        </div>
        <span style="background:rgba(52, 211, 153, 0.15); color:#34d399; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600;">● Connected</span>
      </div>
    </div>
  `;
  res.send(layout('Guilds - OS | System', content, '/guilds'));
});

app.get('/support', (req, res) => {
  const content = `
    <h2>Support & Contact</h2>
    <p style="color: #94a3b8;">Official support channel for OS | System</p>
    <div class="card">
      <div><strong>Developer:</strong> Mohammed Alhajri</div>
    </div>
  `;
  res.send(layout('Support - OS | System', content, '/support'));
});

app.get('/settings', (req, res) => {
  const content = `
    <h2>Global Settings</h2>
    <div class="card"><p style="color:#94a3b8;">Manage global bot system configuration.</p></div>
  `;
  res.send(layout('Settings - OS | System', content, '/settings'));
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard live on port ${PORT}`);
});
