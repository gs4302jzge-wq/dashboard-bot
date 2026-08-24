const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// إعداد خادم الرفع للصورة
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `bg-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const CONFIG_PATH = path.join(__dirname, 'welcomeConfig.json');

function getWelcomeConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {}
    return global.welcomeConfig || {};
}

function saveWelcomeConfig(data) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
        global.welcomeConfig = data;
    } catch (e) {}
}

// Endpoint لاستقبال رفع صورة الخلفية من اللوحة
app.post('/api/welcome/upload-bg', upload.single('bgImage'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'لم يتم رفع صورة' });

    const currentConfig = getWelcomeConfig();
    const bgPath = path.join(__dirname, '../uploads', req.file.filename);
    
    currentConfig.uploadedBgPath = bgPath;
    saveWelcomeConfig(currentConfig);

    res.json({ success: true, bgPath: `/uploads/${req.file.filename}` });
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`✅ Bot ready & live as: ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
    try {
        const config = getWelcomeConfig();

        // 1. تحديد القناة
        let channel = null;
        const savedId = config.welcomeChannelId || config.channelId || config.channel;

        if (savedId && /^\d+$/.test(savedId)) {
            channel = member.guild.channels.cache.get(savedId);
        }

        if (!channel) {
            channel = member.guild.channels.cache.find(c => 
                c.isTextBased() && 
                (c.name.includes('welcome') || c.name.includes('ترحيب') || c.name.includes('عام')) &&
                c.permissionsFor(member.guild.members.me).has(['SendMessages', 'AttachFiles'])
            );
        }

        if (!channel) {
            channel = member.guild.systemChannel || member.guild.channels.cache.find(c => 
                c.isTextBased() && c.permissionsFor(member.guild.members.me).has(['SendMessages', 'AttachFiles'])
            );
        }

        if (!channel) return;

        // 2. تجهيز النص
        const rawText = config.welcomeMsg || config.text || 'Welcome {user} to {server}!';
        const messageContent = rawText
            .replace('{user}', `<@${member.id}>`)
            .replace('{username}', member.user.username)
            .replace('{memberCount}', member.guild.memberCount)
            .replace('{server}', member.guild.name);

        // 3. رسم الكرت والخلفية
        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        // محاولة رسم الصورة المرفوعة أولاً
        let bgLoaded = false;
        if (config.uploadedBgPath && fs.existsSync(config.uploadedBgPath)) {
            try {
                const customBg = await loadImage(config.uploadedBgPath);
                ctx.drawImage(customBg, 0, 0, canvas.width, canvas.height);
                bgLoaded = true;
            } catch (err) {
                console.error('خطأ في تحميل خلفية الصورة المرفوعة:', err);
            }
        }

        // في حال عدم وجود صورة مرفوعة يتم اختيار اللون الافتراضي
        if (!bgLoaded) {
            ctx.fillStyle = config.bgColor || '#1e2238';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // إطار الكرت
        ctx.strokeStyle = '#2b2f4a';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // النص واسم العضو
        ctx.font = 'bold 42px sans-serif';
        ctx.fillStyle = config.textColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(config.textContent || 'Welcome to Our Server', canvas.width / 2, 380);

        ctx.font = '32px sans-serif';
        ctx.fillStyle = config.usernameColor || '#a0a5cc';
        ctx.fillText(`${member.user.username}`, canvas.width / 2, 430);

        // أفتار العضو
        const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 512 });
        const avatarImage = await loadImage(avatarURL);

        const avatarX = canvas.width / 2;
        const avatarY = 190;
        const avatarRadius = 90;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
            avatarImage,
            avatarX - avatarRadius,
            avatarY - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
        );
        ctx.restore();

        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#5865F2';
        ctx.stroke();

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome-image.png' });

        await channel.send({
            content: messageContent,
            files: [attachment]
        });

    } catch (error) {
        console.error('Error sending welcome image:', error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server & Dashboard running on port ${PORT}`));

client.login(process.env.DISCORD_TOKEN);
