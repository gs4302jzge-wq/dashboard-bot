const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد خادم رفع الصور
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, `bg_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const CONFIG_PATH = path.join(__dirname, 'welcomeConfig.json');

function getConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {}
    return {
        welcomeEnabled: true,
        welcomeChannelId: '',
        welcomeMsg: 'Welcome {user} to {server}!',
        textContent: 'Welcome to Our Server',
        bgColor: '#1e2238',
        textColor: '#ffffff',
        usernameColor: '#a0a5cc',
        bgImagePath: ''
    };
}

function saveConfig(cfg) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// APIs اللوحة الجديدة
app.get('/api/config', (req, res) => res.json(getConfig()));

app.post('/api/config', upload.single('bgImage'), (req, res) => {
    let current = getConfig();
    let updated = { ...req.body };

    // تحويل القيم النصية لبولين
    updated.welcomeEnabled = req.body.welcomeEnabled === 'true' || req.body.welcomeEnabled === true;

    if (req.file) {
        updated.bgImagePath = `/uploads/${req.file.filename}`;
    }

    const finalConfig = { ...current, ...updated };
    saveConfig(finalConfig);
    res.json({ success: true, config: finalConfig });
});

// API جلب رومات الديسكورد للوحة التحكم
app.get('/api/channels', (req, res) => {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) return res.json([]);
        const channels = guild.channels.cache
            .filter(c => c.isTextBased())
            .map(c => ({ id: c.id, name: c.name }));
        res.json(channels);
    } catch (e) {
        res.json([]);
    }
});

// تشغيل البوت
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// دالة رسم الصورة الشاملة
async function generateWelcomeCard(config, member) {
    const canvas = createCanvas(1024, 500);
    const ctx = canvas.getContext('2d');

    // 1. رسم الخلفية المرفوعة أو اللون
    let bgLoaded = false;
    if (config.bgImagePath) {
        const fullBgPath = path.join(__dirname, '../public', config.bgImagePath);
        if (fs.existsSync(fullBgPath)) {
            try {
                const bgImg = await loadImage(fullBgPath);
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                bgLoaded = true;
            } catch (e) {}
        }
    }

    if (!bgLoaded) {
        ctx.fillStyle = config.bgColor || '#1e2238';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // إطار عصري
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // 2. كتابة النص الترحيبي واسم المستخدم
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = config.textColor || '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(config.textContent || 'Welcome to Our Server', canvas.width / 2, 380);

    ctx.font = '32px sans-serif';
    ctx.fillStyle = config.usernameColor || '#a0a5cc';
    ctx.fillText(member ? member.user.username : 'SampleUser', canvas.width / 2, 430);

    // 3. رسم الأفتار
    const avatarX = canvas.width / 2;
    const avatarY = 190;
    const avatarRadius = 90;

    const avatarURL = member 
        ? member.user.displayAvatarURL({ extension: 'png', size: 512 })
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    try {
        const avatarImage = await loadImage(avatarURL);
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImage, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();
    } catch (e) {}

    // إطار دائر حول الأفتار
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#5865F2';
    ctx.stroke();

    return canvas.encode('png');
}

// حدث دخول العضو
client.on('guildMemberAdd', async (member) => {
    const config = getConfig();

    if (config.welcomeEnabled === false) return;

    // تحديد القناة
    let channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel) {
        channel = member.guild.systemChannel || member.guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(member.guild.members.me).has('SendMessages'));
    }
    if (!channel) return;

    const msgText = (config.welcomeMsg || 'Welcome {user} to {server}!')
        .replace('{user}', `<@${member.id}>`)
        .replace('{username}', member.user.username)
        .replace('{memberCount}', member.guild.memberCount)
        .replace('{server}', member.guild.name);

    try {
        const buffer = await generateWelcomeCard(config, member);
        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
        await channel.send({ content: msgText, files: [attachment] });
    } catch (err) {
        await channel.send({ content: msgText });
    }
});

app.listen(PORT, () => console.log(`🚀 New Dashboard active on port ${PORT}`));
client.login(process.env.DISCORD_TOKEN);
