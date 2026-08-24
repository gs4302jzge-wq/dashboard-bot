const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { renderProbotCard } = require('./modules/probotWelcome');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// مسار حفظ إعدادات الترحيب محلياً
const CONFIG_PATH = path.join(__dirname, 'welcomeConfig.json');

// دالة جلب الإعدادات المحفوظة
function getWelcomeConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('خطأ في قراءة ملف الإعدادات:', e);
    }
    return global.welcomeConfig || {};
}

client.on('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
});

// === حدث الترحيب عند الانضمام ===
client.on('guildMemberAdd', async (member) => {
    // جلب الإعدادات المحدثة المباشرة
    const config = getWelcomeConfig();

    // 1. تحديد الروم (أولوية للروم المحدد في اللوحة)
    const channelId = config.welcomeChannelId || config.channelId || process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) {
        console.log('لم يتم العثور على القناة الترحيبية المحددة.');
        return;
    }

    // 2. تجهيز النص
    const rawText = config.welcomeMsg || config.text || 'Welcome {user} to {server}!';
    const messageContent = rawText
        .replace('{user}', `<@${member.id}>`)
        .replace('{username}', member.user.username)
        .replace('{memberCount}', member.guild.memberCount)
        .replace('{server}', member.guild.name);

    // 3. محاولة رسم وإرسال الصورة دائماً إلا إذا تم تعطيلها صراحة
    try {
        const buffer = await renderProbotCard(config, {
            avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
            username: member.user.username
        });

        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
        await channel.send({ content: messageContent, files: [attachment] });
        console.log('تم إرسال الصورة والنص بنجاح!');
    } catch (err) {
        console.error('تعذر إنشاء أو إرسال الصورة، جاري إرسال النص فقط:', err);
        await channel.send({ content: messageContent });
    }
});

client.login(process.env.DISCORD_TOKEN);
