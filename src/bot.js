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
    console.log(`✅ Bot ready as: ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
    console.log(`👤 New member joined: ${member.user.username}`);

    // جلب القناة من البيئة أو الإعدادات
    const channelId = process.env.WELCOME_CHANNEL_ID || global.welcomeConfig?.welcomeChannelId;
    const channel = member.guild.channels.cache.get(channelId) || member.guild.systemChannel;

    if (!channel) {
        console.error('❌ لم يتم العثور على قناة الترحيب.');
        return;
    }

    const messageContent = `Welcome <@${member.id}> to **${member.guild.name}**!`;

    try {
        // إنشاء بطاقة الترحيب
        const buffer = await renderProbotCard(global.welcomeConfig || {}, {
            avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
            username: member.user.username
        });

        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

        // إرسال النص مع المرفق
        await channel.send({ content: messageContent, files: [attachment] });
        console.log('🖼️ تم إرسال صورة الترحيب بنجاح!');
    } catch (err) {
        console.error('❌ خطأ أثناء إرسال الصورة:', err);
        // في حال وجود خلل في الصلاحيات يتم إرسال النص
        await channel.send({ content: messageContent });
    }
});

client.login(process.env.DISCORD_TOKEN);
