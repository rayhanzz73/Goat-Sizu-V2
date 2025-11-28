const { getStreamsFromAttachment } = global.utils;
const mediaTypes = ["photo", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    version: "1.2",
    author: "SIFU",
    countDown: 5,
    role: 2,
    description: "Relay messages between users and a fixed admin group",
    category: "contacts admin",
    guide: "{pn} <message>"
  },

  langs: {
    en: {
      missingMessage: "Please enter the message you want to send",
      success: "Your message has been sent to the admin group!",
      failed: "Error sending message, check console",
      replySuccess: "Reply sent successfully!"
    }
  },

  onStart: async function ({ args, message, event, usersData, api, getLang }) {
    if (!args[0]) return message.reply(getLang("missingMessage"));

    const senderName = await usersData.getName(event.senderID);
    const ADMIN_GROUP_ID = "1969428260490804"; // Fixed admin group ID

    const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])]
      .filter(item => mediaTypes.includes(item.type));

    const formMessage = {
      body:
        `📨 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐅𝐫𝐨𝐦: ${senderName}\n` +
        `🆔 𝐔𝐬𝐞𝐫 𝐈𝐃: ${event.senderID}\n` +
        `💬 𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐃: ${event.threadID}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `${args.join(" ")}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🌊 ʸᵒᵘʳ Sɪxᴜ 🎀`,
      attachment: attachments.length ? await getStreamsFromAttachment(attachments) : undefined
    };

    try {
      const sentMessage = await api.sendMessage(formMessage, ADMIN_GROUP_ID);

      // Store relay info for admin reply
      global.GoatBot.onReply.set(sentMessage.messageID, {
        type: "relayToUser",
        commandName: "callad",
        originalThreadID: event.threadID,
        originalSenderID: event.senderID
      });

      return message.reply(getLang("success"));
    } catch (err) {
      console.error("CallAdmin Error:", err);
      return message.reply(getLang("failed"));
    }
  },

  onReply: async function ({ args, event, api, Reply, message, usersData, getLang }) {
    if (!Reply) return;

    const attachments = event.attachments.filter(item => mediaTypes.includes(item.type));
    const senderName = await usersData.getName(event.senderID);

    let formMessage = {};
    let targetID;

    if (Reply.type === "relayToUser") {
      // Admin replying to user
      formMessage = {
        body:
          `🗿 𝐑𝐞𝐩𝐥𝐲 𝐅𝐫𝐨𝐦 𝐀𝐝𝐦𝐢𝐧: ${senderName}\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `${args.join(" ")}\n` +
          `━━━━━━━━━━━━━━━━━━`,
        attachment: attachments.length ? await getStreamsFromAttachment(attachments) : undefined
      };
      targetID = Reply.originalThreadID;

      // Store relay info for user reply back to admin
      global.GoatBot.onReply.set(event.messageID, {
        type: "relayToAdmin",
        commandName: "callad",
        originalAdminMessageID: event.messageID
      });

    } else if (Reply.type === "relayToAdmin") {
      // User replying back to admin
      const ADMIN_GROUP_ID = "1969428260490804";
      formMessage = {
        body:
          `📨 𝐔𝐬𝐞𝐫 𝐑𝐞𝐩𝐥𝐲: ${senderName}\n` +
          `💬 𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐃: ${event.threadID}\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `${args.join(" ")}\n` +
          `━━━━━━━━━━━━━━━━━━`,
        attachment: attachments.length ? await getStreamsFromAttachment(attachments) : undefined
      };
      targetID = ADMIN_GROUP_ID;

      // Store relay info for admin reply again
      global.GoatBot.onReply.set(event.messageID, {
        type: "relayToUser",
        commandName: "callad",
        originalThreadID: event.threadID,
        originalSenderID: event.senderID
      });
    } else {
      return; // not a relay message
    }

    try {
      await api.sendMessage(formMessage, targetID);
      message.reply(getLang("replySuccess"));
    } catch (err) {
      console.error("Relay Error:", err);
    }
  }
};