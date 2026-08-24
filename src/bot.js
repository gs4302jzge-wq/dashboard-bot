const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

// === 1. WELCOME EVENT (الترحيب) ===
client.on('guildMemberAdd', async (member) => {
    const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || '123456789012345678';
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    try {
        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        // رسم الخلفية
        const background = await loadImage('https://probot.media/IqoX.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // رسم الأفتار بشكل دائري متناسق في المنتصف الأعلي
        ctx.save();
        ctx.beginPath();
        ctx.arc(512, 160, 90, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.drawImage(avatar, 422, 70, 180, 180);
        ctx.restore();

        // إطار دائري حول الأفتار
        ctx.beginPath();
        ctx.arc(512, 160, 90, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#5865F2';
        ctx.stroke();

        // كتابة اسم العضو (تحت الأفتار مباشرة)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 42px Sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(member.user.username, 512, 320);

        // نص الترحيب ورقم العضو
        ctx.font = '28px Sans-serif';
        ctx.fillStyle = '#B9BBBE';
        ctx.fillText(`Welcome to the server! Member #${member.guild.memberCount}`, 512, 370);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome.png' });
        channel.send({
            content: `مرحبًا بك ${member} في السيرفر!`,
            files: [attachment]
        });
    } catch (err) {
        console.error('Welcome Error:', err);
    }
});

// === 2. LEAVE EVENT (المغادرة) ===
client.on('guildMemberRemove', async (member) => {
    const LEAVE_CHANNEL_ID = process.env.LEAVE_CHANNEL_ID || process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
    if (!channel) return;

    try {
        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        const background = await loadImage('https://probot.media/IqoX.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.beginPath();
        ctx.arc(512, 160, 90, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.drawImage(avatar, 422, 70, 180, 180);
        ctx.restore();

        ctx.fillStyle = '#FF4B4B';
        ctx.font = 'bold 42px Sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Goodbye, ${member.user.username}`, 512, 320);

        ctx.font = '28px Sans-serif';
        ctx.fillStyle = '#B9BBBE';
        ctx.fillText(`We now have ${member.guild.memberCount} members.`, 512, 370);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'goodbye.png' });
        channel.send({
            content: `غادر العضو **${member.user.username}** السيرفر.`,
            files: [attachment]
        });
    } catch (err) {
        console.error('Leave Error:', err);
    }
});

// === Independent Welcome & Leave Events ===
const { generateWelcomeCard } = require('./modules/welcomeCanvas');
const { AttachmentBuilder } = require('discord.js');

// حدث انضمام عضو (Welcome)
client.on('guildMemberAdd', async (member) => {
    const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const buffer = await generateWelcomeCard({
        avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
        username: member.user.username,
        textContent: 'Welcome to Our Server',
        backgroundUrl: 'https://probot.media/IqoX.png'
    });

    const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
    channel.send({ content: `مرحبًا بك ${member}!`, files: [attachment] });
});

// حدث مغادرة عضو (Leave Message)
client.on('guildMemberRemove', async (member) => {
    const LEAVE_CHANNEL_ID = process.env.LEAVE_CHANNEL_ID || process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
    if (!channel) return;

    const buffer = await generateWelcomeCard({
        avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
        username: member.user.username,
        textContent: 'Goodbye & Good Luck!',
        backgroundUrl: 'https://probot.media/IqoX.png'
    });

    const attachment = new AttachmentBuilder(buffer, { name: 'goodbye.png' });
    channel.send({ content: `غادر العضو ${member.user.tag}`, files: [attachment] });
});
