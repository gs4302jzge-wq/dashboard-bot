const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

function getWelcomeConfig() {
    try {
        const configPath = path.join(__dirname, 'welcomeConfig.json');
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (e) {}
    return global.welcomeConfig || {};
}

client.on('ready', () => {
    console.log(`✅ Bot ready & live as: ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
    try {
        const config = getWelcomeConfig();

        // 1. البحث عن القناة الذكية (تتجاهل الرموز الغريبة مثل ⍞)
        let channel = null;
        const savedId = config.welcomeChannelId || config.channelId || config.channel;

        // التحقق مما إذا كان الآيدي المنسوق عبارة عن أرقام فقط (آيدي ديسكورد حقيقي)
        if (savedId && /^\d+$/.test(savedId)) {
            channel = member.guild.channels.cache.get(savedId);
        }

        // إذا لم يجد القناة أو كان الرمز في الموقع خربان، يختار روم الترحيب تلقائياً من اسمها
        if (!channel) {
            channel = member.guild.channels.cache.find(c => 
                c.isTextBased() && 
                (c.name.includes('welcome') || c.name.includes('ترحيب') || c.name.includes('عام')) &&
                c.permissionsFor(member.guild.members.me).has(['SendMessages', 'AttachFiles'])
            );
        }

        // خيار احتياطي أخير: أول قناة كتابية يمتلك فيها البوت صلاحيات
        if (!channel) {
            channel = member.guild.systemChannel || member.guild.channels.cache.find(c => 
                c.isTextBased() && c.permissionsFor(member.guild.members.me).has(['SendMessages', 'AttachFiles'])
            );
        }

        if (!channel) return;

        // 2. نص الترحيب
        const rawText = config.welcomeMsg || config.text || 'Welcome {user} to {server}!';
        const messageContent = rawText
            .replace('{user}', `<@${member.id}>`)
            .replace('{username}', member.user.username)
            .replace('{memberCount}', member.guild.memberCount)
            .replace('{server}', member.guild.name);

        // 3. رسم كرت الترحيب بالـ Canvas مباشرة
        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = config.bgColor || '#1e2238';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#2b2f4a';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        ctx.font = 'bold 42px sans-serif';
        ctx.fillStyle = config.textColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(config.textContent || 'Welcome to Our Server', canvas.width / 2, 380);

        ctx.font = '32px sans-serif';
        ctx.fillStyle = config.usernameColor || '#a0a5cc';
        ctx.fillText(`${member.user.username}`, canvas.width / 2, 430);

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

        // 4. إرسال النص والصورة معاً دائماً
        await channel.send({
            content: messageContent,
            files: [attachment]
        });

    } catch (error) {
        console.error('Error sending welcome image:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
