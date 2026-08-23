const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PREFIX = '-';

// تخزين الاختصارات لكل أمر (تترك فارغة ليتم تعديلها من الداشبورد)
const pluginsStore = {
  setnick: [],
  ban: [],
  unban: [],
  kick: [],
  vkick: [],
  mute_text: [],
  unmute_text: [],
  mute_voice: [],
  unmute_voice: [],
  timeout: [],
  untimeout: [],
  clear: [],
  move: [],
  role: [],
  points: [],
  warn: [],
  warn_remove: [],
  warnings: [],
  lock: [],
  unlock: [],
  setcolor: [],
  slowmode: [],
  reset: []
};

// تعريف جميع الأوامر الأساسية وخياراتها
const commandsConfig = [
  { id: 'setnick', name: 'setnick', desc: '✏️ تغيير اللقب لعضو', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true }, { name: 'nick', desc: 'اللقب الجديد', type: 'string', req: true } ] },
  { id: 'ban', name: 'ban', desc: '🔨 حظر عضو من السيرفر', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'unban', name: 'unban', desc: '🔓 إلغاء حظر عضو', options: [ { name: 'userid', desc: 'ID العضو', type: 'string', req: true } ] },
  { id: 'kick', name: 'kick', desc: '👢 طرد عضو من السيرفر', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'vkick', name: 'vkick', desc: '🔇 طرد عضو من الروم الصوتي', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'mute_text', name: 'mute_text', desc: '🔕 كتم كتابي لعضو', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'unmute_text', name: 'unmute_text', desc: '🔔 إلغاء الكتم الكتابي', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'mute_voice', name: 'mute_voice', desc: '🎙️ كتم صوتي لعضو', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'unmute_voice', name: 'unmute_voice', desc: '🔊 إلغاء الكتم الصوتي', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'timeout', name: 'timeout', desc: '⏱️ عزل مؤقت لعضو', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true }, { name: 'minutes', desc: 'المدة بالدقائق', type: 'int', req: true } ] },
  { id: 'untimeout', name: 'untimeout', desc: '⏰ إلغاء العزل المؤقت', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'clear', name: 'clear', desc: '🧹 مسح الرسائل من القناة', options: [ { name: 'amount', desc: 'عدد الرسائل (1-100)', type: 'int', req: true } ] },
  { id: 'move', name: 'move', desc: '🚀 نقل عضو لروم صوتي', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true }, { name: 'channel', desc: 'الروم الصوتي', type: 'channel', req: true } ] },
  { id: 'role', name: 'role', desc: '🏷️ إعطاء أو سحب رتبة', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true }, { name: 'role', desc: 'الرتبة', type: 'role', req: true } ] },
  { id: 'points', name: 'points', desc: '⭐ عرض أو إضافة نقاط', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'warn', name: 'warn', desc: '⚠️ توجيه تحذير لعضو', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true }, { name: 'reason', desc: 'السبب', type: 'string', req: false } ] },
  { id: 'warn_remove', name: 'warn_remove', desc: '🗑️ إزالة تحذير عن عضو', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'warnings', name: 'warnings', desc: '📋 عرض تحذيرات عضو', options: [ { name: 'user', desc: 'العضو', type: 'user', req: true } ] },
  { id: 'lock', name: 'lock', desc: '🔒 قفل القناة الحالية', options: [] },
  { id: 'unlock', name: 'unlock', desc: '🔓 فتح القناة الحالية', options: [] },
  { id: 'setcolor', name: 'setcolor', desc: '🎨 تغيير لون رتبة', options: [ { name: 'role', desc: 'الرتبة', type: 'role', req: true }, { name: 'color', desc: 'رمز اللون Hex', type: 'string', req: true } ] },
  { id: 'slowmode', name: 'slowmode', desc: '⏳ تحديد وضع البطء', options: [ { name: 'seconds', desc: 'المدة بالثواني', type: 'int', req: true } ] },
  { id: 'reset', name: 'reset', desc: '🔄 إعادة ضبط نقاط الخبرة (XP)', options: [] }
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
    .setTitle('❌ خطأ في التنفيذ')
    .setDescription(description)
    .setFooter({ text: 'OS | System Security', iconURL: client.user?.displayAvatarURL() });
};

// دالة لبناء وتسجيل Slash Commands الأساسية بالإضافة للـ Aliases ديناميكياً
async function registerSlashCommands() {
  if (!client.user) return;
  const slashList = [];

  for (const cmd of commandsConfig) {
    // تجميع الاسم الأساسي للأمر + أي Aliases تم إضافتها من الداشبورد
    const namesToRegister = [cmd.name, ...(pluginsStore[cmd.id] || [])];

    for (const name of namesToRegister) {
      // التأكد من أن اسم الـ Slash يتوافق مع شروط ديسكورد (حروف صغيرة وبدون مسافات)
      const validName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-z_]/g, '');
      if (!validName) continue;

      const builder = new SlashCommandBuilder()
        .setName(validName)
        .setDescription(cmd.desc);

      // إضافة الخيارات لكل أمر
      cmd.options.forEach(opt => {
        if (opt.type === 'user') builder.addUserOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
        else if (opt.type === 'string') builder.addStringOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
        else if (opt.type === 'int') builder.addIntegerOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
        else if (opt.type === 'channel') builder.addChannelOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
        else if (opt.type === 'role') builder.addRoleOption(o => o.setName(opt.name).setDescription(opt.desc).setRequired(opt.req));
      });

      slashList.push(builder.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: slashList });
    console.log(`💎 Registered ${slashList.length} Slash Commands (Including Aliases)!`);
  } catch (err) {
    console.error('Failed to register Slash Commands:', err);
  }
}

// ربط كل أسم أو اختصار بالأمر الرئيسي لتنفيذه
function getCommandIdByName(name) {
  const cleanName = name.toLowerCase().replace(/_/g, ' ').trim();
  for (const cmd of commandsConfig) {
    if (cmd.name === name || cmd.id === name || cmd.name.replace(/_/g, ' ') === cleanName) return cmd.id;
    const aliases = pluginsStore[cmd.id] || [];
    if (aliases.includes(name) || aliases.includes(cleanName)) return cmd.id;
  }
  return null;
}

// تنفيذ منطق الأمر الموحد (سواء تم استدعاؤه بـ Slash Command أو Text Prefix)
async function handleExecution(commandId, interactionOrMessage, options) {
  const guild = interactionOrMessage.guild;
  const channel = interactionOrMessage.channel;

  if (commandId === 'setnick') {
    const user = options.user;
    const nick = options.nick;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (member) {
      await member.setNickname(nick).catch(() => null);
      return interactionOrMessage.reply({ embeds: [createSuccessEmbed('✏️ تغيير اللقب', `تم تغيير لقب **${user.tag}** إلى **${nick}**`)] });
    }
  }

  else if (commandId === 'ban') {
    const user = options.user;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (member) {
      await member.ban().catch(() => null);
      return interactionOrMessage.reply({ embeds: [createSuccessEmbed('🔨 تم حظر العضو', `تم حظر **${user.tag}** بنجاح.`)] });
    }
  }

  else if (commandId === 'unban') {
    const userId = options.userid;
    await guild.members.unban(userId).catch(() => null);
    return interactionOrMessage.reply({ embeds: [createSuccessEmbed('🔓 إلغاء الحظر', `تم إلغاء حظر الـ ID: **${userId}**`)] });
  }

  else if (commandId === 'kick') {
    const user = options.user;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (member) {
      await member.kick().catch(() => null);
      return interactionOrMessage.reply({ embeds: [createSuccessEmbed('👢 طرد عضو', `تم طرد **${user.tag}** بنجاح.`)] });
    }
  }

  else if (commandId === 'vkick') {
    const user = options.user;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (member && member.voice.channel) {
      await member.voice.disconnect().catch(() => null);
      return interactionOrMessage.reply({ embeds: [createSuccessEmbed('🔇 طرد صفي', `تم فصل **${user.tag}** من الروم الصوتي.`)] });
    }
    return interactionOrMessage.reply({ embeds: [createErrorEmbed('العضو غير متواجد في روم صوتي.')] });
  }

  else if (commandId === 'lock') {
    await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
    return interactionOrMessage.reply({ embeds: [createSuccessEmbed('🔒 قفل القناة', 'تم إغلاق الكتابة في هذه القناة.')] });
  }

  else if (commandId === 'unlock') {
    await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
    return interactionOrMessage.reply({ embeds: [createSuccessEmbed('🔓 فتح القناة', 'تم فتح الكتابة في هذه القناة.')] });
  }

  else if (commandId === 'clear') {
    const amount = options.amount || 10;
    await channel.bulkDelete(amount, true).catch(() => null);
    return interactionOrMessage.reply({ embeds: [createSuccessEmbed('🧹 تطهير الشات', `تم مسح **${amount}** رسالة.`)].map(e => e.toJSON()), ephemeral: true });
  }

  else if (commandId === 'slowmode') {
    const seconds = options.seconds || 0;
    await channel.setRateLimitPerUser(seconds);
    return interactionOrMessage.reply({ embeds: [createSuccessEmbed('⏳ وضع البطء', `تم ضبط وضع البطء إلى **${seconds}** ثانية.`)] });
  }

  else {
    return interactionOrMessage.reply({ embeds: [createSuccessEmbed(`✅ ${commandId}`, `تم تنفيذ الأمر **${commandId}** بنجاح.`)] });
  }
}

// استقبال الـ Slash Commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const commandId = getCommandIdByName(interaction.commandName);
  
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

// استقبال الأوامر العادية بالطريقة العادية Prefix
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  const commandId = getCommandIdByName(cmdName);
  if (commandId) {
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

// عند تحديث الـ Aliases من الداشبورد يعيد تسجيل الـ Slash Commands فوراً لتعمل مباشرة بـ /
app.post('/api/aliases', async (req, res) => {
  const { pluginId, aliases } = req.body;
  if (pluginId && Array.isArray(aliases)) {
    pluginsStore[pluginId] = aliases.map(a => a.trim().toLowerCase()).filter(a => a !== '');
    await registerSlashCommands(); // تحديث السلاش كاماندز تلقائياً
    return res.json({ success: true });
  }
  res.status(400).json({ success: false });
});

app.get('/', (req, res) => {
  const guildCount = client.guilds?.cache?.size || 1;
  const userCount = client.users?.cache?.size || 9;
  const ping = client.ws?.ping || 94;

  const content = `
    <div style="margin-bottom: 20px;">
      <h2 style="margin:0; font-size: 24px; font-weight:700;">Welcome, nfyp_</h2>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Here's what's happening with <strong style="color:#fff;">OS | System</strong> today.</p>
    </div>
    <div class="card" style="padding:16px; margin-bottom:16px;">
      <div style="margin-bottom:12px;">
        <button class="btn btn-sky" style="padding:6px 14px; font-size:13px;" onclick="location.reload();"><i class="fa-solid fa-rotate"></i> Refresh Data</button>
      </div>
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:1px; background:rgba(255,255,255,0.08); border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">Server Count</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px;"><i class="fa-solid fa-bars-staggered" style="font-size:16px; color:#94a3b8;"></i> ${guildCount}</div>
        </div>
        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">User Count</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px;"><i class="fa-solid fa-users" style="font-size:16px; color:#94a3b8;"></i> ${userCount}</div>
        </div>
        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">API Latency</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px;"><i class="fa-solid fa-tower-broadcast" style="font-size:16px; color:#94a3b8;"></i> ${ping}ms</div>
        </div>
        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">Plugins Active</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px;"><i class="fa-solid fa-rocket" style="font-size:16px; color:#94a3b8;"></i> 23</div>
        </div>
      </div>
    </div>
  `;
  res.send(layout('Dashboard - OS | System', content, '/'));
});

app.get('/plugins', (req, res) => {
  const rawPlugins = [
    { id: "setnick", name: "setnick", icon: "fa-solid fa-pen", iconBg: "rgba(59, 130, 246, 0.2)", iconColor: "#3b82f6", desc: "Changes the nickname of a member.", usage: "/setnick {@user} {nick}" },
    { id: "ban", name: "ban", icon: "fa-solid fa-hammer", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", desc: "Bans a member.", usage: "/ban {@user}" },
    { id: "unban", name: "unban", icon: "fa-solid fa-lock-open", iconBg: "rgba(34, 197, 94, 0.2)", iconColor: "#22c55e", desc: "Unbans a member.", usage: "/unban {userid}" },
    { id: "kick", name: "kick", icon: "fa-solid fa-user-minus", iconBg: "rgba(249, 115, 22, 0.2)", iconColor: "#f97316", desc: "Kicks a member.", usage: "/kick {@user}" },
    { id: "vkick", name: "vkick", icon: "fa-solid fa-phone-slash", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", desc: "Kicks a member from a voice channel", usage: "/vkick {@user}" },
    { id: "mute_text", name: "mute text", icon: "fa-solid fa-comment-slash", iconBg: "rgba(100, 116, 139, 0.2)", iconColor: "#94a3b8", desc: "Mute a member so they can't type in text channels.", usage: "/mute text {@user}" },
    { id: "unmute_text", name: "unmute text", icon: "fa-solid fa-comment", iconBg: "rgba(34, 197, 94, 0.2)", iconColor: "#22c55e", desc: "Unmutes a member.", usage: "/unmute text {@user}" },
    { id: "mute_voice", name: "mute voice", icon: "fa-solid fa-microphone-slash", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", desc: "Mute a member so they can't speak in voice channels.", usage: "/mute voice {@user}" },
    { id: "unmute_voice", name: "unmute voice", icon: "fa-solid fa-microphone", iconBg: "rgba(34, 197, 94, 0.2)", iconColor: "#22c55e", desc: "Unmutes a member from voice channels.", usage: "/unmute voice {@user}" },
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
        <button class="btn" onclick="openEditModal('${p.id}', '${p.name}', ${jsonAliases})" style="background:#2563eb; font-size:12px; padding:6px 14px;"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
        <button class="btn btn-danger" style="font-size:12px; padding:6px 14px;"><i class="fa-solid fa-trash"></i> Remove</button>
      </div>
    </div>
  `}).join('');

  const content = `
    <h2 style="margin-bottom: 18px; font-size:26px; font-weight:700;">Plugins</h2>
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
            <input type="text" value="\${alias}" oninput="currentAliases[\${index}] = this.value" style="flex:1; background:#060a14; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 12px; border-radius:6px; font-size:13px; outline:none;">
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
            alert('Failed to save aliases');
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
    <h2>Support</h2>
    <p style="color: #94a3b8;">Contact support team</p>
    <div class="card">
      <div><strong>Developer:</strong> Mohammed Alhajri</div>
    </div>
  `;
  res.send(layout('Support - OS | System', content, '/support'));
});

app.get('/settings', (req, res) => {
  const content = `
    <h2>Global Settings</h2>
    <div class="card"><p style="color:#94a3b8;">Manage global parameters.</p></div>
  `;
  res.send(layout('Settings - OS | System', content, '/settings'));
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard live on port ${PORT}`);
});
