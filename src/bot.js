const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const { renderProbotCard } = require('./modules/probotWelcome');

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// إعداد التخزين لرفع الصور من جهازك
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const CONFIG_PATH = path.join(__dirname, 'welcomeConfig.json');

function getConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {}
    return {};
}

function saveConfig(cfg) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// Route لرفع صورة الخلفية والأفتار وتحديث الإعدادات مباشرة
app.post('/api/welcome/config', upload.fields([{ name: 'bgFile' }, { name: 'avatarFile' }]), (req, res) => {
    let currentConfig = getConfig();
    let updatedData = { ...req.body };

    if (req.files?.bgFile?.[0]) {
        updatedData.uploadedBgPath = path.join(__dirname, '../uploads', req.files.bgFile[0].filename);
    }
    if (req.files?.avatarFile?.[0]) {
        updatedData.uploadedAvatarPath = path.join(__dirname, '../uploads', req.files.avatarFile[0].filename);
    }

    const finalConfig = { ...currentConfig, ...updatedData };
    saveConfig(finalConfig);
    global.welcomeConfig = finalConfig;

    res.json({ success: true, config: finalConfig });
});

// Route للمعاينة المباشرة على اللوحة (Live Preview)
app.get('/api/welcome/preview', async (req, res) => {
    try {
        const config = getConfig();
        const buffer = await renderProbotCard(config, {
            avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
            username: 'SampleUser#0000'
        });
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) {
        res.status(500).send('Error rendering preview');
    }
});

// === حدث الترحيب الرئيسي عند الانضمام ===
client.on('guildMemberAdd', async (member) => {
    const config = getConfig();

    if (config.welcomeEnabled === false) return;

    const channelId = config.welcomeChannelId || process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId) || member.guild.systemChannel;
    if (!channel) return;

    const messageContent = (config.welcomeMsg || 'Welcome {user} to {server}!')
        .replace('{user}', `<@${member.id}>`)
        .replace('{username}', member.user.username)
        .replace('{memberCount}', member.guild.memberCount)
        .replace('{server}', member.guild.name);

    try {
        const buffer = await renderProbotCard(config, {
            avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
            username: member.user.username
        });

        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
        await channel.send({ content: messageContent, files: [attachment] });
    } catch (err) {
        console.error('Error sending welcome image:', err);
        await channel.send({ content: messageContent });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

client.login(process.env.DISCORD_TOKEN);
