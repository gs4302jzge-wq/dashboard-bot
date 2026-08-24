const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { renderProbotCard } = require('./modules/probotWelcome');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
});

// === حدث انضمام عضو جديد (الترحيب) ===
client.on('guildMemberAdd', async (member) => {
    const config = global.welcomeConfig || {};

    // 1. التحقق من تفعيل مفتاح الترحيب الرئيسي
    if (config.welcomeEnabled === false) return;

    // 2. تحديد روم الترحيب
    const channelId = config.welcomeChannelId || process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    // 3. تجهيز نص الترحيب
    const messageContent = (config.welcomeMsg || 'Welcome {user} to {server}!')
        .replace('{user}', `<@${member.id}>`)
        .replace('{username}', member.user.username)
        .replace('{memberCount}', member.guild.memberCount)
        .replace('{server}', member.guild.name);

    // 4. التحقق من مفتاح إرسال الصورة
    const shouldSendImage = config.welcomeImageEnabled !== false;

    if (shouldSendImage) {
        try {
            const buffer = await renderProbotCard(config, {
                avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
                username: member.user.username
            });

            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            await channel.send({ content: messageContent, files: [attachment] });
        } catch (err) {
            console.error('خطأ في إنشاء أو إرسال الصورة، يتم إرسال النص فقط:', err);
            await channel.send({ content: messageContent });
        }
    } else {
        await channel.send({ content: messageContent });
    }
});

// === حدث خروج عضو (المغادرة) ===
client.on('guildMemberRemove', async (member) => {
    const config = global.leaveConfig || {};

    if (config.leaveEnabled === false) return;

    const channelId = config.leaveChannelId || process.env.LEAVE_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const leaveMsg = (config.leaveMsg || '{username} left the server.')
        .replace('{username}', member.user.username)
        .replace('{server}', member.guild.name);

    await channel.send({ content: leaveMsg });
});

client.login(process.env.DISCORD_TOKEN);
