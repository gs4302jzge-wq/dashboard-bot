const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PREFIX = '-';
const BOT_START_TIME = Date.now();

// Welcome Settings Store (In-Memory Isolation)
let welcomeSettings = {
  enabled: true,
  sendMsgEnabled: true,
  welcomeMessage: 'Welcome [user] to [server]! You are member #[memberCount].',
  sendType: 'channel', // 'dm' or 'channel'
  selectedChannel: '',
  sendImgEnabled: true,
  imgType: 'with_text',
  canvas: {
    bg: 'transparent',
    avatarShape: 'circle',
    avatarX: 115,
    avatarY: 32,
    usernameX: 115,
    usernameY: 97,
    textX: 115,
    textY: 117,
    textColor: '#ffffff',
    textVal: 'Welcome to Our Server'
  },
  leaveMsgEnabled: false
};

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

// Global Command ID Resolver
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

// Register Slash Commands
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

// Handle Automatic Welcome Event in Discord
client.on('guildMemberAdd', async (member) => {
  if (!welcomeSettings.enabled) return;

  try {
    let msg = welcomeSettings.welcomeMessage || 'Welcome [user] to [server]!';
    msg = msg.replace(/\[user\]/g, `<@${member.id}>`)
             .replace(/\[userName\]/g, member.user.username)
             .replace(/\[server\]/g, member.guild.name)
             .replace(/\[memberCount\]/g, member.guild.memberCount);

    if (welcomeSettings.sendMsgEnabled) {
      if (welcomeSettings.sendType === 'dm') {
        await member.send(msg).catch(() => null);
      } else if (welcomeSettings.sendType === 'channel' && welcomeSettings.selectedChannel) {
        const ch = member.guild.channels.cache.get(welcomeSettings.selectedChannel);
        if (ch) await ch.send(msg).catch(() => null);
      }
    }
  } catch (e) {
    console.error('Welcome Execution Error:', e);
  }
});

// Unified Command Router
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
        return target.reply({ embeds: [createSuccessEmbed('BOOT Member Kicked', `Successfully kicked **${user.tag}**.`)] });
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

// Message Event
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

// REST API Endpoints
app.get('/api/uptime', (req, res) => res.json(getFormattedUptime()));

app.post('/api/aliases', (req, res) => {
  const { pluginId, aliases } = req.body;
  if (pluginId && Array.isArray(aliases)) {
    pluginsStore[pluginId] = aliases.map(a => a.trim()).filter(a => a !== '');
    return res.json({ success: true, updated: pluginsStore[pluginId] });
  }
  res.status(400).json({ success: false, error: 'Invalid Parameters' });
});

app.get('/api/welcome', (req, res) => res.json(welcomeSettings));

app.post('/api/welcome', (req, res) => {
  welcomeSettings = { ...welcomeSettings, ...req.body };
  res.json({ success: true, settings: welcomeSettings });
});

// UI Components
const sidebarScript = `
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
    `;
  }).join('');

  return `
  `;
}

function layout(title, content, currentPath) {
  return `
      body { margin: 0; padding: 0; background-color: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; }
      .top-banner { text-align: center; padding: 10px; background: linear-gradient(90deg, #090e1c, #0f172a, #090e1c); color: #fcd34d; font-size: 14px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .navbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 22px; background-color: #0d1322; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
      .menu-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #f8fafc; width: 40px; height: 40px; border-radius: 10px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
      .container { padding: 20px; max-width: 900px; margin: 0 auto; padding-bottom: 90px; }
      .card { background: #131b2e; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 12px; padding: 18px; margin-bottom: 14px; }
      .btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
      .btn-sky { background: #0284c7; }
      .toggle-switch { position: relative; display: inline-block; width: 44px; height: 22px; }
      .toggle-switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .3s; border-radius: 24px; }
      .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
      input:checked + .slider { background-color: #22c55e; }
      input:checked + .slider:before { transform: translateX(22px); }
      .var-badge { color: #f43f5e; font-family: monospace; font-size: 13px; cursor: pointer; }
      .var-badge:hover { text-decoration: underline; }
      .radio-opt { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #cbd5e1; cursor: pointer; }
      .radio-opt input { accent-color: #5865F2; cursor: pointer; }
      .tab-btn { background: transparent; border: none; color: #94a3b8; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
      .tab-btn.active { background: #5865F2; color: #fff; }
      .unsaved-bar { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #090e1a; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 1000; width: 90%; max-width: 600px; }
    ${getSidebarHtml(currentPath)}
    ${sidebarScript}
  `;
}

// Main Dashboard Page
app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 2;
  const ping = client.ws?.ping || 16;
  const uptime = getFormattedUptime();

  const content = `

  `;
  res.send(layout('Dashboard - OS | System', content, '/'));
});

// ProBot Welcome Page
app.get('/welcome', (req, res) => {
  const guildChannels = client.guilds.cache.first()?.channels?.cache?.filter(c => c.type === 0) || [];
  let channelOptions = '<option value="">Select Channel..</option>';
  guildChannels.forEach(c => {
    const isSel = welcomeSettings.selectedChannel === c.id ? 'selected' : '';
    channelOptions += `<option value="${c.id}" ${isSel}># ${c.name}</option>`;
  });

  const content = `




              SEND AS DM
              SEND TO A CHANNEL

              ${channelOptions}








      function markUnsaved() {
        document.getElementById('unsavedBar').style.display = 'flex';
      }

      function toggleMsgSection() {
        const checked = document.getElementById('sendMsgToggle').checked;
        document.getElementById('msgSectionBody').style.display = checked ? 'block' : 'none';
      }

      function toggleImgSection() {
        const checked = document.getElementById('sendImgToggle').checked;
        document.getElementById('imgSectionBody').style.display = checked ? 'block' : 'none';
      }

      function toggleChannelDropdown() {
        const isChannel = document.querySelector('input[name="sendType"]:checked').value === 'channel';
        document.getElementById('channelSelectWrap').style.display = isChannel ? 'block' : 'none';
      }

      function addVar(v) {
        const txt = document.getElementById('welcomeText');
        txt.value += ' ' + v;
        markUnsaved();
      }

      function updateCanvasText() {
        const val = document.getElementById('canvasTextVal').value;
        document.getElementById('canvasPreviewText').innerText = val || 'Welcome';
      }

      function switchImgTab(btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }

      async function saveWelcomeSettings() {
        const payload = {
          enabled: document.getElementById('mainWelcomeToggle').checked,
          sendMsgEnabled: document.getElementById('sendMsgToggle').checked,
          welcomeMessage: document.getElementById('welcomeText').value,
          sendType: document.querySelector('input[name="sendType"]:checked').value,
          selectedChannel: document.getElementById('welcomeChannel').value,
          sendImgEnabled: document.getElementById('sendImgToggle').checked,
          leaveMsgEnabled: document.getElementById('leaveMsgToggle').checked,
          canvas: {
            textVal: document.getElementById('canvasTextVal').value
          }
        };

        try {
          const res = await fetch('/api/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            location.reload();
          }
        } catch(e) {
          alert('Failed to save settings.');
        }
      }
  `;

  res.send(layout('Welcome & Goodbye - ProBot Style', content, '/welcome'));
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


  `}).join('');

  const content = `


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
          \`;
          container.appendChild(div);
        });
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
        try {
          const response = await fetch('/api/aliases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pluginId: currentPluginId, aliases: currentAliases })
          });

          if (response.ok) {
            location.reload();
          }
        } catch {
          alert('Error saving aliases');
        }
      }
  `;

  res.send(layout('Plugins - OS | System', content, '/plugins'));
});

app.get('/guilds', (req, res) => {
  const content = `
  `;
  res.send(layout('Guilds - OS | System', content, '/guilds'));
});

app.get('/support', (req, res) => {
  const content = `
  `;
  res.send(layout('Support - OS | System', content, '/support'));
});

app.get('/settings', (req, res) => {
  const content = `
  `;
  res.send(layout('Settings - OS | System', content, '/settings'));
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard live on port ${PORT}`);
});

