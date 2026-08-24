const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function handleWelcome(member) {
  try {
    const configPath = path.join(__dirname, 'welcomeConfig.json');
    if (!fs.existsSync(configPath)) return;

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config.enabled || !config.channelId) return;

    const channel = member.guild.channels.cache.get(config.channelId);
    if (!channel) return;

    let text = config.message || 'أهلاً بك {user} في {server}!';
    text = text
      .replace(/{user}/g, `<@${member.id}>`)
      .replace(/{username}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{memberCount}/g, member.guild.memberCount);

    await channel.send({ content: text });
  } catch (err) {
    console.error('Error in Welcome Service:', err);
  }
}

module.exports = { handleWelcome };
