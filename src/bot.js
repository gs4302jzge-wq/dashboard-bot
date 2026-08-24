const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { renderProbotCard } = require('./modules/probotWelcome');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const CONFIG_PATH = path.join(__dirname, 'welcomeConfig.json');

// دالة حفظ وقراءة الإعدادات
function getWelcomeConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading config file:', e);
    }
    return global.welcomeConfig || {};
}

function saveWelcomeConfig(data) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
        global.welcomeConfig = data;
    } catch (e) {
        console.error('Error saving config file:', e);
    }
}

// Endpoint استقبال الإعدادات من زر Save Changes باللوحة
app.post('/api/welcome/save', (req, res) => {
    const currentConfig = getWelcomeConfig();
    const newConfig = { ...currentConfig, ...req.body };
    saveWelcomeConfig(newConfig);
    res.json({ success: true, config: newConfig });
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
    console.log(`✅ Bot logged in as ${client.user.tag}`);
});

// === حدث الترحيب عند انضمام عضو جديد ===
client.on('guildMemberAdd', async (member) => {
    const config = getWelcomeConfig();

    // 1. تحديد روم الترحيب
    const channelId = config.welcomeChannelId || config.channelId || config.channel || process.env.WELCOME_CHANNEL_ID;
    let channel = member.guild.channels.cache.get(channelId);
    
    if (!channel) {
        channel = member.guild.systemChannel || member.guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(member.guild.members.me).has('SendMessages'));
    }

    if (!channel) return;

    // 2. تجهيز النص الترحيبي
    const rawText = config.welcomeMsg || config.text || 'Welcome {user} to {server}!';
    const messageContent = rawText
        .replace('{user}', `<@${member.id}>`)
        .replace('{username}', member.user.username)
        .replace('{memberCount}', member.guild.memberCount)
        .replace('{server}', member.guild.name);

    // 3. الفحص الإجباري لزر الصورة
    // سنرسل الصورة دائماً طالما أن خيار الصورة غير معطل صراحة بقيمة false
    const isImageEnabled = config.welcomeImageEnabled !== false && config.sendImage !== false && config.imageEnabled !== false;

    if (isImageEnabled) {
        try {
            const buffer = await renderProbotCard(config, {
                avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
                username: member.user.username
            });

            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            await channel.send({ content: messageContent, files: [attachment] });
            console.log('🖼️ Welcome image sent successfully!');
        } catch (err) {
            console.error('❌ Failed to render/send image, sending text only:', err);
            await channel.send({ content: messageContent });
        }
    } else {
        await channel.send({ content: messageContent });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

client.login(process.env.DISCORD_TOKEN);
