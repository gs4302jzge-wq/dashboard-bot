const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

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

// Endpoint استقبال بيانات اللوحة والصورة المرفوعة مباشرة
app.post('/api/welcome/save', (req, res) => {
    try {
        const currentConfig = getWelcomeConfig();
        const updatedConfig = { ...currentConfig, ...req.body };
        saveWelcomeConfig(updatedConfig);
        res.json({ success: true, config: updatedConfig });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

client.on('ready', () => {
    console.log(`✅ Bot operating successfully as: ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
    try {
        const config = getWelcomeConfig();

        // 1. تحديد قناة الترحيب الذكية
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

        // 3. بناء لوحة الترحيب عبر Canvas
        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        // محاولة تحميل الصورة المرفوعة (سواء Base64 أو رابط أو ملف محلي)
        let bgLoaded = false;
        const customImageSrc = config.uploadedBg || config.bgUrl || config.backgroundImage;

        if (customImageSrc) {
            try {
                const bgImg = await loadImage(customImageSrc);
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                bgLoaded = true;
            } catch (err) {
                console.error('❌ Failed to render uploaded background image:', err);
            }
        }

        // إطار ولون احتياطي في حال عدم تحميل الصورة
        if (!bgLoaded) {
            ctx.fillStyle = config.bgColor || '#1e2238';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // إطار شفاف جمالي فوق الخلفية
        ctx.strokeStyle = '#2b2f4a';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // كتابة النصوص
        ctx.font = 'bold 42px sans-serif';
        ctx.fillStyle = config.textColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(config.textContent || 'Welcome to Our Server', canvas.width / 2, 380);

        ctx.font = '32px sans-serif';
        ctx.fillStyle = config.usernameColor || '#a0a5cc';
        ctx.fillText(`${member.user.username}`, canvas.width / 2, 430);

        // جلب صورة أفتار العضو
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

        // إطار الأفتار
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#5865F2';
        ctx.stroke();

        // 4. التصدير والإرسال
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome-image.png' });

        await channel.send({
            content: messageContent,
            files: [attachment]
        });

    } catch (error) {
        console.error('Error generating or sending welcome card:', error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Dashboard server running on port ${PORT}`));

client.login(process.env.DISCORD_TOKEN);
