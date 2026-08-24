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

const CONFIG_PATH = path.join(__dirname, 'welcomeConfig.json');

function getWelcomeConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {}
    return global.welcomeConfig || {};
}

client.on('ready', () => {
    console.log(`✅ Bot ready: ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
    const config = getWelcomeConfig();

    // 1. التفتيش عن القناة من اللوحة أو من القناة الافتراضية للفرع
    let channelId = config.welcomeChannelId || config.channelId || config.channel;
    let channel = member.guild.channels.cache.get(channelId);

    if (!channel) {
        // في حال لم يتم تحديد القناة من اللوحة، نستخدم روم النظام أو أول روم كتابي
        channel = member.guild.systemChannel || member.guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(member.guild.members.me).has('SendMessages'));
    }

    if (!channel) {
        console.error('❌ لم يتم العثور على أي قناة صالحة لإرسال الترحيب.');
        return;
    }

    // 2. تجهيز نص الترحيب
    const rawText = config.welcomeMsg || config.text || 'Welcome {user} to {server}!';
    const messageContent = rawText
        .replace('{user}', `<@${member.id}>`)
        .replace('{username}', member.user.username)
        .replace('{memberCount}', member.guild.memberCount)
        .replace('{server}', member.guild.name);

    // 3. إنتاج وإرسال الصورة
    try {
        const buffer = await renderProbotCard(config, {
            avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
            username: member.user.username
        });

        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
        await channel.send({ content: messageContent, files: [attachment] });
        console.log('🖼️ تم إرسال الصورة والنص بنجاح في القناة:', channel.name);
    } catch (err) {
        console.error('❌ خطأ أثناء توليد/إرسال الصورة:', err);
        await channel.send({ content: messageContent });
    }
});

client.login(process.env.DISCORD_TOKEN);
