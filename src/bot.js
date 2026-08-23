/**
 * Discord Bot Client Initialization (Discord.js v14)
 */
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
});

client.commands = new Collection();
client.aliases = new Collection();

// Bot Ready Event
client.once('ready', () => {
  console.log(`🤖 Discord Bot logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} guilds and ${client.users.cache.size} users`);
  
  client.user.setActivity({
    name: `Dashboard Active | ${client.guilds.cache.size} servers`,
    type: 0 // Playing
  });
});

// Basic Ping Command & Message Listener
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = process.env.BOT_PREFIX || '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    const pingMsg = await message.reply('🏓 Pinging...');
    const latency = pingMsg.createdTimestamp - message.createdTimestamp;
    pingMsg.edit(`🏓 Pong! Latency: ${latency}ms | API Ping: ${Math.round(client.ws.ping)}ms`);
  }

  if (command === 'serverinfo') {
    message.reply(`🏷️ **${message.guild.name}** has ${message.guild.memberCount} members.`);
  }
});

// Login Bot if TOKEN is set
if (process.env.BOT_TOKEN) {
  client.login(process.env.BOT_TOKEN).catch(err => {
    console.error('❌ Failed to login Discord Bot:', err.message);
  });
} else {
  console.warn('⚠️ BOT_TOKEN is not set in environment variables. Web dashboard will run in standby mode.');
}

module.exports = { client };

// === ProBot Canvas Welcome System ===
const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

client.on('guildMemberAdd', async (member) => {
    const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || 'ضع_آيدي_الروم_هنا';
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    try {
        const canvas = createCanvas(1024, 450);
        const ctx = canvas.getContext('2d');

        const background = await loadImage('https://probot.media/IqoX.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.beginPath();
        ctx.arc(512, 180, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.drawImage(avatar, 412, 80, 200, 200);
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Welcome, ${member.user.username}!`, 512, 340);

        ctx.font = '30px Sans-serif';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`Member #${member.guild.memberCount}`, 512, 390);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome-image.png' });
        channel.send({
            content: `مرحبًا بك ${member} في السيرفر!`,
            files: [attachment]
        });
    } catch (err) {
        console.error('Welcome Image Error:', err);
    }
});
