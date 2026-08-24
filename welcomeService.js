const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
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

    const canvasWidth = 800;
    const canvasHeight = 360;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    let bgImage;
    if (config.bgImagePath && fs.existsSync(config.bgImagePath)) {
      bgImage = await loadImage(config.bgImagePath);
    } else if (config.bgUrl) {
      bgImage = await loadImage(config.bgUrl);
    }

    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = '#23272A';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    const avatarX = config.avatarX ?? 400;
    const avatarY = config.avatarY ?? 120;
    const avatarRadius = config.avatarRadius ?? 60;

    try {
      const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
      const avatarImg = await loadImage(avatarUrl);

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        avatarImg,
        avatarX - avatarRadius,
        avatarY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      ctx.restore();

      ctx.strokeStyle = config.borderColor || '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
      ctx.stroke();
    } catch (e) {
      console.error('Error loading avatar:', e);
    }

    ctx.font = 'bold 32px Sans-serif';
    ctx.fillStyle = config.textColor || '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(config.textOverlay || `Welcome, ${member.user.username}!`, canvasWidth / 2, canvasHeight - 50);

    const buffer = await canvas.encode('png');
    const attachment = new AttachmentBuilder(buffer, { name: 'welcome-image.png' });

    await channel.send({ content: text, files: [attachment] });

  } catch (err) {
    console.error('Error in Welcome Service:', err);
  }
}

module.exports = { handleWelcome };
