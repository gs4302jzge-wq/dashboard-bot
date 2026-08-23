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
