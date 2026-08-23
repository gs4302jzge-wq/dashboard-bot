const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PREFIX = '-';

const pluginsStore = {
  ban: ['م'],
  clear: ['مسح'],
  coin: ['حظ'],
  kick: ['طرد'],
  lock: ['قفل'],
  unlock: ['فتح'],
  slowmode: ['بطء', 'بطئ'],
  timeout: ['ميوت', 'عزل'],
  untimeout: ['فك_الميوت', 'فك_العزل']
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const BOT_TOKEN = process.env.DISCORD_TOKEN;

// Embed Utility Templates
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

const createWarnEmbed = (title, usage) => {
  return new EmbedBuilder()
    .setColor('#f59e0b')
    .setTitle(`⚠️ ${title}`)
    .addFields({ name: 'طريقة الاستخدام الصحيحة:', value: `\`\`\`${usage}\`\`\`` })
    .setFooter({ text: 'OS | System Assistance', iconURL: client.user?.displayAvatarURL() });
};

async function registerSlashCommands(clientId) {
  const commands = [
    new SlashCommandBuilder().setName('ban').setDescription('🔨 حظر عضو من السيرفر').addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('🧹 مسح الرسائل من القناة').addIntegerOption(opt => opt.setName('amount').setDescription('عدد الرسائل (1-100)').setRequired(true)),
    new SlashCommandBuilder().setName('coin').setDescription('🪙 رمي العملة النقدية'),
    new SlashCommandBuilder().setName('kick').setDescription('👢 طرد عضو من السيرفر').addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('🔒 قفل القناة الحالية'),
    new SlashCommandBuilder().setName('unlock').setDescription('🔓 فتح القناة الحالية'),
    new SlashCommandBuilder().setName('slowmode').setDescription('⏳ تحديد وضع البطء').addIntegerOption(opt => opt.setName('seconds').setDescription('المدة بالثواني').setRequired(true)),
    new SlashCommandBuilder().setName('timeout').setDescription('⏱️ عزل/ميوت عضو').addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(true)).addIntegerOption(opt => opt.setName('minutes').setDescription('المدة بالدقائق').setRequired(true)),
    new SlashCommandBuilder().setName('untimeout').setDescription('🔊 إلغاء العزل/الميوت عن عضو').addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(true))
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('💎 Slash Commands Registered Successfully!');
  } catch (err) {
    console.error('Failed to register Slash Commands:', err);
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'ban') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **حظر الأعضاء**.')], ephemeral: true });
    }
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [createErrorEmbed('تعذر العثور على العضو.')], ephemeral: true });
    try {
      await member.ban();
      interaction.reply({ embeds: [createSuccessEmbed('🔨 تم حظر العضو', `تم تنفيذ القرار وحظر **${user.tag}** بنجاح.`)] });
    } catch {
      interaction.reply({ embeds: [createErrorEmbed('تعذر حظر العضو، تأكد من رتبة البوت.')], ephemeral: true });
    }
  }

  else if (commandName === 'clear') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة الرسائل**.')], ephemeral: true });
    }
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100) return interaction.reply({ embeds: [createErrorEmbed('حدد رقماً بين **1** و **100**.')], ephemeral: true });
    try {
      await interaction.channel.bulkDelete(amount, true);
      interaction.reply({ embeds: [createSuccessEmbed('🧹 تطهير الشات', `تم مسح **${amount}** رسالة بنجاح.`)], ephemeral: true });
    } catch {
      interaction.reply({ embeds: [createErrorEmbed('تعذر مسح الرسائل (قد تكون قديمة جداً).')], ephemeral: true });
    }
  }

  else if (commandName === 'coin') {
    const isHeads = Math.random() < 0.5;
    interaction.reply({ embeds: [createSuccessEmbed('🪙 نتيجة القرعة', `استقرت العملة على: **${isHeads ? '👑 ملك (Heads)' : '📜 كتابة (Tails)'}**`)] });
  }

  else if (commandName === 'kick') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **طرد الأعضاء**.')], ephemeral: true });
    }
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [createErrorEmbed('تعذر العثور على العضو.')], ephemeral: true });
    try {
      await member.kick();
      interaction.reply({ embeds: [createSuccessEmbed('👢 تم طرد العضو', `تم طرد **${user.tag}** بنجاح.`)] });
    } catch {
      interaction.reply({ embeds: [createErrorEmbed('تعذر طرد العضو.')], ephemeral: true });
    }
  }

  else if (commandName === 'lock') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة القنوات**.')], ephemeral: true });
    }
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    interaction.reply({ embeds: [createSuccessEmbed('🔒 قفل القناة', 'تم إغلاق الكتابة في هذه القناة بنجاح.')] });
  }

  else if (commandName === 'unlock') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة القنوات**.')], ephemeral: true });
    }
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
    interaction.reply({ embeds: [createSuccessEmbed('🔓 فتح القناة', 'تم فتح الكتابة في هذه القناة بنجاح.')] });
  }

  else if (commandName === 'slowmode') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة القنوات**.')], ephemeral: true });
    }
    const seconds = interaction.options.getInteger('seconds');
    await interaction.channel.setRateLimitPerUser(seconds);
    interaction.reply({ embeds: [createSuccessEmbed('⏳ وضع البطء', `تم ضبط وضع البطء إلى **${seconds}** ثانية.`)] });
  }

  else if (commandName === 'timeout') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة الأعضاء**.')], ephemeral: true });
    }
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [createErrorEmbed('تعذر العثور على العضو.')], ephemeral: true });
    try {
      await member.timeout(minutes * 60 * 1000);
      interaction.reply({ embeds: [createSuccessEmbed('⏱️ عزل العضو', `تم إعطاء **${user.tag}** ميوت لمدة **${minutes}** دقيقة.`)] });
    } catch {
      interaction.reply({ embeds: [createErrorEmbed('تعذر عزل العضو.')], ephemeral: true });
    }
  }

  else if (commandName === 'untimeout') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة الأعضاء**.')], ephemeral: true });
    }
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [createErrorEmbed('تعذر العثور على العضو.')], ephemeral: true });
    try {
      await member.timeout(null);
      interaction.reply({ embeds: [createSuccessEmbed('🔊 فك العزل', `تم فك الميوت عن **${user.tag}** بنجاح.`)] });
    } catch {
      interaction.reply({ embeds: [createErrorEmbed('تعذر فك الميوت عن العضو.')], ephemeral: true });
    }
  }
});

// Handling Message Commands (Prefix & Non-Prefix + Aliases)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let rawContent = message.content.trim();
  if (rawContent.startsWith(PREFIX)) {
    rawContent = rawContent.slice(PREFIX.length).trim();
  }

  const args = rawContent.split(/ +/);
  const inputCmd = args.shift()?.toLowerCase();
  if (!inputCmd) return;

  const matchPlugin = (pluginKey) => {
    if (inputCmd === pluginKey) return true;
    if (pluginsStore[pluginKey] && pluginsStore[pluginKey].includes(inputCmd)) return true;
    return false;
  };

  if (matchPlugin('ban')) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **حظر الأعضاء**.')] });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ embeds: [createWarnEmbed('صيغة الأمر', `ban @user  أو  -ban @user`)] });
    try {
      await member.ban();
      message.channel.send({ embeds: [createSuccessEmbed('🔨 تم حظر العضو', `تم حظر **${member.user.tag}** بنجاح.`)] });
    } catch {
      message.reply({ embeds: [createErrorEmbed('تعذر حظر هذا العضو.')] });
    }
  }

  else if (matchPlugin('clear')) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة الرسائل**.')] });
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) return message.reply({ embeds: [createWarnEmbed('صيغة الأمر', `clear {العدد}  أو  -clear {العدد}`)] });
    try {
      await message.channel.bulkDelete(amount + 1, true);
      const msg = await message.channel.send({ embeds: [createSuccessEmbed('🧹 تطهير الشات', `تم مسح **${amount}** رسالة بنجاح.`)] });
      setTimeout(() => msg.delete().catch(() => {}), 4000);
    } catch {
      message.reply({ embeds: [createErrorEmbed('حدث خطأ أثناء مسح الرسائل.')] });
    }
  }

  else if (matchPlugin('coin')) {
    const isHeads = Math.random() < 0.5;
    message.reply({ embeds: [createSuccessEmbed('🪙 نتيجة القرعة', `استقرت العملة على: **${isHeads ? '👑 ملك (Heads)' : '📜 كتابة (Tails)'}**`)] });
  }

  else if (matchPlugin('kick')) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **طرد الأعضاء**.')] });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ embeds: [createWarnEmbed('صيغة الأمر', `kick @user  أو  -kick @user`)] });
    try {
      await member.kick();
      message.channel.send({ embeds: [createSuccessEmbed('👢 تم طرد العضو', `تم طرد **${member.user.tag}** بنجاح.`)] });
    } catch {
      message.reply({ embeds: [createErrorEmbed('تعذر طرد العضو.')] });
    }
  }

  else if (matchPlugin('lock')) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة القنوات**.')] });
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
    message.channel.send({ embeds: [createSuccessEmbed('🔒 قفل القناة', 'تم إغلاق الكتابة في هذه القناة بنجاح.')] });
  }

  else if (matchPlugin('unlock')) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة القنوات**.')] });
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
    message.channel.send({ embeds: [createSuccessEmbed('🔓 فتح القناة', 'تم فتح الكتابة في هذه القناة بنجاح.')] });
  }

  else if (matchPlugin('slowmode')) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة القنوات**.')] });
    const seconds = parseInt(args[0]);
    if (isNaN(seconds)) return message.reply({ embeds: [createWarnEmbed('صيغة الأمر', `slowmode {الثواني}  أو  بطء {الثواني}`)] });
    await message.channel.setRateLimitPerUser(seconds);
    message.channel.send({ embeds: [createSuccessEmbed('⏳ وضع البطء', `تم ضبط وضع البطء إلى **${seconds}** ثانية.`)] });
  }

  else if (matchPlugin('timeout')) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة الأعضاء**.')] });
    const member = message.mentions.members.first();
    const minutes = parseInt(args[1]);
    if (!member || isNaN(minutes)) return message.reply({ embeds: [createWarnEmbed('صيغة الأمر', `timeout @user {الدقائق}  أو  عزل @user {الدقائق}`)] });
    try {
      await member.timeout(minutes * 60 * 1000);
      message.channel.send({ embeds: [createSuccessEmbed('⏱️ عزل العضو', `تم إعطاء **${member.user.tag}** ميوت لمدة **${minutes}** دقيقة.`)] });
    } catch {
      message.reply({ embeds: [createErrorEmbed('تعذر عزل العضو.')] });
    }
  }

  else if (matchPlugin('untimeout')) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply({ embeds: [createErrorEmbed('لا تمتلك صلاحية **إدارة الأعضاء**.')] });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ embeds: [createWarnEmbed('صيغة الأمر', `untimeout @user  أو  فك_الميوت @user`)] });
    try {
      await member.timeout(null);
      message.channel.send({ embeds: [createSuccessEmbed('🔊 فك العزل', `تم فك الميوت عن **${member.user.tag}** بنجاح.`)] });
    } catch {
      message.reply({ embeds: [createErrorEmbed('تعذر فك الميوت عن العضو.')] });
    }
  }
});

if (BOT_TOKEN) {
  client.once('ready', () => {
    console.log(`🤖 Logged in as: ${client.user.tag}`);
    registerSlashCommands(client.user.id);
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
        background: #0d1527;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 16px;
      }
      .btn {
        background: #2563eb;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
      }
      .btn-sky { background: #0284c7; }
      .btn-danger { background: #ef4444; }
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 46px;
        height: 24px;
      }
      .toggle-switch input { opacity: 0; width: 0; height: 0; }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #334155;
        transition: .3s;
        border-radius: 24px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
      }
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
    <div class="container">
      ${content}
    </div>
    ${sidebarScript}
  </body>
  </html>
  `;
}

app.post('/api/aliases', (req, res) => {
  const { pluginId, aliases } = req.body;
  if (pluginId && Array.isArray(aliases)) {
    pluginsStore[pluginId] = aliases.map(a => a.trim().toLowerCase()).filter(a => a !== '');
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
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">Server Count (Guilds)</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-bars-staggered" style="font-size:16px; color:#94a3b8;"></i> ${guildCount}
          </div>
        </div>
        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">User Count (All Guilds)</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-users" style="font-size:16px; color:#94a3b8;"></i> ${userCount}
          </div>
        </div>
        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">API Latency</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-tower-broadcast" style="font-size:16px; color:#94a3b8;"></i> ${ping}ms
          </div>
        </div>
        <div style="background:#0d1527; padding:16px 12px; text-align:left;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600;">Prefix</div>
          <div style="font-size:22px; font-weight:bold; color:#fff; margin-top:8px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-bullhorn" style="font-size:16px; color:#94a3b8;"></i> - / Slash
          </div>
        </div>
      </div>
    </div>
  `;
  res.send(layout('Dashboard - OS | System', content, '/'));
});

app.get('/plugins', (req, res) => {
  const pluginsData = [
    { id: "ban", name: "Ban", icon: "fa-solid fa-hammer", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", iconBorder: "rgba(239, 68, 68, 0.4)", developer: "Mohammed Alhajri", description: "Bans a user from the server.", usage: "-ban {@user} or ban {@user}", aliases: pluginsStore.ban || [], enabled: true },
    { id: "clear", name: "clear", icon: "fa-solid fa-broom", iconBg: "rgba(20, 184, 166, 0.2)", iconColor: "#14b8a6", iconBorder: "rgba(20, 184, 166, 0.4)", developer: "Mohammed Alhajri", description: "Clears messages from a channel.", usage: "-clear {amount} or clear {amount}", aliases: pluginsStore.clear || [], enabled: true },
    { id: "coin", name: "coin", icon: "fa-solid fa-coins", iconBg: "rgba(245, 158, 11, 0.2)", iconColor: "#f59e0b", iconBorder: "rgba(245, 158, 11, 0.4)", developer: "Mohammed Alhajri", description: "Simple coin flip command", usage: "-coin or coin", aliases: pluginsStore.coin || [], enabled: true },
    { id: "kick", name: "kick", icon: "fa-solid fa-user-minus", iconBg: "rgba(249, 115, 22, 0.2)", iconColor: "#f97316", iconBorder: "rgba(249, 115, 22, 0.4)", developer: "Mohammed Alhajri", description: "Kicks a user from the server.", usage: "-kick {@user} or kick {@user}", aliases: pluginsStore.kick || [], enabled: true },
    { id: "lock", name: "lock", icon: "fa-solid fa-lock", iconBg: "rgba(239, 68, 68, 0.2)", iconColor: "#ef4444", iconBorder: "rgba(239, 68, 68, 0.4)", developer: "Mohammed Alhajri", description: "Locks current channel from messaging.", usage: "-lock or lock", aliases: pluginsStore.lock || [], enabled: true },
    { id: "unlock", name: "unlock", icon: "fa-solid fa-lock-open", iconBg: "rgba(34, 197, 94, 0.2)", iconColor: "#22c55e", iconBorder: "rgba(34, 197, 94, 0.4)", developer: "Mohammed Alhajri", description: "Unlocks current channel.", usage: "-unlock or unlock", aliases: pluginsStore.unlock || [], enabled: true },
    { id: "slowmode", name: "slowmode", icon: "fa-solid fa-hourglass-half", iconBg: "rgba(168, 85, 247, 0.2)", iconColor: "#a855f7", iconBorder: "rgba(168, 85, 247, 0.4)", developer: "Mohammed Alhajri", description: "Sets slowmode delay on a channel.", usage: "-slowmode {seconds}", aliases: pluginsStore.slowmode || [], enabled: true },
    { id: "timeout", name: "timeout", icon: "fa-solid fa-clock", iconBg: "rgba(234, 179, 8, 0.2)", iconColor: "#eab308", iconBorder: "rgba(234, 179, 8, 0.4)", developer: "Mohammed Alhajri", description: "Mutes/Timeouts a member.", usage: "-timeout {@user} {minutes}", aliases: pluginsStore.timeout || [], enabled: true },
    { id: "untimeout", name: "untimeout", icon: "fa-solid fa-volume-high", iconBg: "rgba(59, 130, 246, 0.2)", iconColor: "#3b82f6", iconBorder: "rgba(59, 130, 246, 0.4)", developer: "Mohammed Alhajri", description: "Removes timeout/mute from member.", usage: "-untimeout {@user}", aliases: pluginsStore.untimeout || [], enabled: true }
  ];

  const pluginCards = pluginsData.map(p => {
    const jsonAliases = JSON.stringify(p.aliases).replace(/"/g, '&quot;');
    const aliasesDisplay = p.aliases.length > 0 
      ? `<span style="color:#38bdf8; font-weight:600;">${p.aliases.join(', ')}</span>` 
      : `<span style="color:#94a3b8; font-weight:600;">None</span>`;

    return `
    <div class="card" style="padding:20px; margin-bottom:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:42px; height:42px; border-radius:10px; background:${p.iconBg}; border:1px solid ${p.iconBorder}; color:${p.iconColor}; display:flex; align-items:center; justify-content:center; font-size:18px;">
            <i class="${p.icon}"></i>
          </div>
          <h3 style="margin:0; font-size:20px; font-weight:700; color:#fff;">${p.name}</h3>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${p.enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <div style="font-size:13px; color:#cbd5e1; line-height:1.8; margin-bottom:16px;">
        <div><strong>Developer:</strong> ${p.developer}</div>
        <div><strong>Description:</strong> ${p.description}</div>
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
    </div>
  `;
  res.send(layout('Guilds - OS | System', content, '/guilds'));
});

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

app.get('/settings', (req, res) => {
  const content = `
    <h2 style="margin-bottom: 6px; font-size:24px;">Global Settings</h2>
    <p style="color: #94a3b8; margin-top: 0; margin-bottom: 20px; font-size:14px;">Configure general system configurations for OS | System.</p>
    <div class="card">
      <h3 style="margin-top:0; font-size:16px; color:#fff;"><i class="fa-solid fa-sliders" style="color:#38bdf8;"></i> System Configuration</h3>
      <p style="color:#94a3b8; font-size:13px;">Manage global dashboard parameters.</p>
    </div>
  `;
  res.send(layout('Settings - OS | System', content, '/settings'));
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard live on port ${PORT}`);
});
