const axios = require("axios");
const simsim = "https://api.cyber-ninjas.top";

module.exports = {
  config: {
    name: "baby",
    version: "2.0.0",
    author: "rX | sifu",
    countDown: 0,
    role: 0,
    shortDescription: "Cute AI Baby Chatbot (Auto Teach + Typing)",
    longDescription: "Talk & Chat with Emotion — Auto teach enabled with typing effect.",
    category: "fun",
    guide: {
      en: "{p}baby [message]\n{p}baby teach [Question] - [Answer]\n{p}baby list"
    }
  },

  // ─────────────── MAIN COMMAND ───────────────
  onStart: async function ({ api, event, args, message, usersData }) {
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);
    const query = args.join(" ").trim().toLowerCase();
    const threadID = event.threadID;
    const messageID = event.messageID;

    // --- Typing System ---
    const sendTyping = async () => {
      try {
        if (typeof api.sendTypingIndicatorV2 === "function") {
          await api.sendTypingIndicatorV2(true, threadID);
          await new Promise(r => setTimeout(r, 3000));
          await api.sendTypingIndicatorV2(false, threadID);
        } else {
          console.error("❌ Typing unsupported: sendTypingIndicatorV2 not found");
        }
      } catch (err) {
        console.error("❌ Typing error:", err.message);
      }
    };

    try {
      if (!query) {
        await sendTyping();
        const ran = ["Bolo baby 💖", "Hea baby 😚"];
        const r = ran[Math.floor(Math.random() * ran.length)];
        return message.reply(r, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
          }
        });
      }

      // ─── Teach command ───
      if (args[0] === "teach") {
        const parts = query.replace("teach ", "").split(" - ");
        if (parts.length < 2)
          return message.reply("Use: baby teach [Question] - [Reply]");
        const [ask, ans] = parts;
        const res = await axios.get(`${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderName=${encodeURIComponent(senderName)}`);
        return message.reply(res.data.message || "Learned successfully!");
      }

      // ─── List command ───
      if (args[0] === "list") {
        const res = await axios.get(`${simsim}/list`);
        if (res.data.code === 200)
          return message.reply(`♾ Total Questions: ${res.data.totalQuestions}\n★ Replies: ${res.data.totalReplies}\n👑 Author: ${res.data.author}`);
        else
          return message.reply(`Error: ${res.data.message || "Failed to fetch list"}`);
      }

      // ─── Normal chat ───
      await sendTyping();
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
      const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];
      if (!responses || responses.length === 0) {
        console.log(`🤖 Auto-teaching new phrase: "${query}"`);
        await axios.get(`${simsim}/teach?ask=${encodeURIComponent(query)}&ans=${encodeURIComponent("hmm baby 😚 (auto learned)")}&senderName=${encodeURIComponent(senderName)}`);
        return message.reply("hmm baby 😚");
      }

      for (const reply of responses) {
        await new Promise((resolve) => {
          message.reply(reply, (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
            }
            resolve();
          });
        });
      }

    } catch (err) {
      console.error("❌ Baby main error:", err);
      message.reply(`Error in baby command: ${err.message}`);
    }
  },

  // ─────────────── HANDLE REPLY ───────────────
  onReply: async function ({ api, event, Reply, message, usersData }) {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderName = await usersData.getName(event.senderID);
    const replyText = event.body ? event.body.trim().toLowerCase() : "";

    const sendTyping = async () => {
      try {
        if (typeof api.sendTypingIndicatorV2 === "function") {
          await api.sendTypingIndicatorV2(true, threadID);
          await new Promise(r => setTimeout(r, 3000));
          await api.sendTypingIndicatorV2(false, threadID);
        }
      } catch (err) {
        console.error("❌ Typing error:", err.message);
      }
    };

    try {
      if (!replyText) return;

      await sendTyping();
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
      const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

      // যদি SimSimi কিছু না পায়, auto-teach করে
      if (!responses || responses.length === 0) {
        console.log(`🧠 Auto-teaching new reply: "${replyText}"`);
        await axios.get(`${simsim}/teach?ask=${encodeURIComponent(replyText)}&ans=${encodeURIComponent("hmm baby 😚 (auto learned)")}&senderName=${encodeURIComponent(senderName)}`);
        return message.reply("hmm baby 😚");
      }

      for (const reply of responses) {
        await new Promise((resolve) => {
          message.reply(reply, (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: event.senderID });
            }
            resolve();
          });
        });
      }

    } catch (err) {
      console.error("❌ Baby reply error:", err);
      message.reply(`Error in baby reply: ${err.message}`);
    }
  },

  // ─────────────── AUTO CHAT TRIGGER ───────────────
  onChat: async function ({ api, event, message, usersData }) {
    const raw = event.body ? event.body.toLowerCase().trim() : "";
    if (!raw) return;

    const senderName = await usersData.getName(event.senderID);
    const senderID = event.senderID;
    const threadID = event.threadID;

    const sendTyping = async () => {
      try {
        if (typeof api.sendTypingIndicatorV2 === "function") {
          await api.sendTypingIndicatorV2(true, threadID);
          await new Promise(r => setTimeout(r, 3000));
          await api.sendTypingIndicatorV2(false, threadID);
        }
      } catch (err) {
        console.error("❌ Typing error:", err.message);
      }
    };

    try {
      const simpleTriggers = ["baby", "bot", "bby", "বেবি", "বট", "oi", "hi", "jan"];
      if (simpleTriggers.includes(raw)) {
        await sendTyping();
        const replies = ["ʙᴏʟᴏ ʙᴀʙᴜ, ᴛᴜᴍɪ ᴋɪ ᴀᴍᴀᴋᴇ ʙʜᴀʟᴏʙᴀꜱᴏ? 🙈💋",
        "ᴋᴀʟᴋᴇ ᴅᴇᴋʜᴀ ᴋᴏʀɪꜱ ᴛᴏ ᴇᴋᴛᴜ 😈ᴋᴀᴊ ᴀꜱᴇ😒",
        "ᴅᴜʀᴇ ᴊᴀ, ᴛᴏʀ ᴋᴏɴᴏ ᴋᴀᴊ ɴᴀɪ, ꜱʜᴜᴅʜᴜ 𝗯𝗯𝘆 𝗯𝗯𝘆 ᴋᴏʀɪꜱ  😉😋🤣",
        "ᴛᴏʀ ᴋɪ ᴄʜᴏᴋʜᴇ ᴘᴏʀᴇ ɴᴀ ᴀᴍɪ BESTHO ᴀꜱɪ😒",
        "ʜᴏᴘ ʙᴇᴅᴀ😾,ʙᴏꜱꜱ ʙᴏʟ ʙᴏꜱꜱ😼",
        "ɢᴏꜱʜᴏʟ ᴋᴏʀᴇ ᴀʏ ᴊᴀ😑😩",
        "ᴇᴛᴀʏ ᴅᴇᴋʜᴀʀ ʙᴀᴋɪ ꜱɪʟᴏ_🙂🙂🙂",
        "ᴀᴍɪ ᴛʜᴀᴋʟᴇᴏ ᴊᴀ, ɴᴀ ᴛʜᴀᴋʟᴇᴏ ᴛᴀ !❤",
        "ᴛᴏʀ ʙɪʏᴇ ʜᴏʏ ɴɪ 𝗕𝗯𝘆 ʜᴏɪʟᴏ ᴋɪʙʜᴀʙᴇ,,🙄",
        "ᴄʜᴜᴘ ᴛʜᴀᴋ ᴛᴏ naile ᴛᴏʀ ᴅᴀᴛ ʙʜᴇɢᴇ ᴅɪʙᴏ ᴋɪɴᴛᴜ",
        "ᴛᴜᴍᴀʀᴇ ᴀᴍɪ ʀᴀɪᴛᴇ ʙʜᴀʟᴏʙᴀꜱɪ 🐸📌",
        "ᴀᴊᴋᴇ ᴀᴍᴀʀ ᴍᴏɴ ʙʜᴀʟᴏ ɴᴇɪ",
        "ᴏɪ ᴛᴜᴍɪ ꜱɪɴɢʟᴇ ɴᴀ?🫵🤨",
        "ᴀʀᴇ ᴀᴍɪ ᴍᴏᴊᴀ ᴋoʀᴀʀ ᴍᴏᴏᴅ ᴇ ɴᴀɪ😒",
        "ᴀᴍɪ ᴏɴnᴇʀ ᴊɪɴɪꜱᴇʀ ꜱᴀᴛʜᴇ ᴋᴛʜᴀ ʙᴏʟɪ ɴᴀ__😏",
        "ᴏᴋᴇ 𝙵𝙖𝙧𝙢𝙖𝙬__😒",
        "ʙʜᴜʟᴇ ᴊᴀᴏ ᴀᴍᴀᴋᴇ 😞😞",
        "𝗧𝗼𝗿 𝘀𝗮𝘁𝗲 𝗸𝗼𝘁𝗵𝗮 𝗻𝗮𝗶,𝗧𝘂𝗶 𝗮𝗯𝗮𝗹😼",
        "ᴀᴍɪ ᴀʙᴀʟ ᴅᴇʀ ꜱᴀᴛʜᴇ ᴋᴛʜᴀ ʙᴏʟɪ ɴᴀ,ᴏᴋ😒",
        "ᴀᴍʀ ᴊᴀɴᴜ ʟᴀɢʙᴇ,ᴛᴜᴍɪ ᴋɪ ꜱɪɴɢʟᴇ ᴀꜱᴏ?",
        "ᴇᴛᴏ CUTE ᴋᴇᴍɴᴇ ʜᴏɪʟɪ ! ᴋɪ ᴋʜᴀꜱ😒",
        "ʜᴀ ᴊᴀɴᴜ , ᴇɪᴅɪᴋ ᴇ ᴀꜱᴏ ᴋɪꜱs ᴅᴇɪ🤭 😘",
        "𝗧𝗮𝗿𝗽𝗼𝗿 𝗯𝗼𝗹𝗼_🙂",
        "ꜰʟɪʀᴛ ᴍᴀᴛ ᴋᴀʀᴏ ꜱᴀᴅɪ ʙᴀʟɪ ʙᴀᴛ ᴋᴀʀᴏᴏ😒",
        "ᴀᴍᴀʀ ᴇxᴀᴍ ᴀᴍɪ ᴘᴏʀᴛᴀꜱɪ",
        "ᴍᴏʀᴇ ɢᴇꜱɪ ᴋᴀʀᴏɴ ᴛᴏᴍᴀᴋᴇ ꜱᴀʀᴀ ᴀᴍɪ ʙᴀᴄᴍᴜ ɴᴀ",
        "ʙᴇꜱʜɪ ʙʙʏ ʙʙʙʏ ᴋᴏʀʟᴇ ʟᴇᴀᴠᴇ ɴɪʙᴏ ᴋɪɴᴛᴜ😒😒",
        "ᴀᴍɪ ᴛᴏᴍᴀʀ ꜱɪɴɪᴏʀ ᴀᴘᴜ ᴏᴋᴇ 😼",
        "ꜱᴏᴍᴍᴀɴ ᴅᴇᴏ🙁",
        "ᴍᴇꜱꜱᴀɢᴇ ɴᴀ ᴅɪʏᴇ ᴛᴏ ᴄᴀʟʟ ᴀᴡ ᴅɪᴛᴇ ᴘᴀʀᴏ ᴛᴀʏ ɴᴀ?",
        "ᴀᴍᴀᴋᴇ ᴅᴇᴋᴏ ɴᴀ,ᴀᴍɪ ʙusy ᴀꜱɪ",
        "ᴛᴏʀᴀ ᴊᴇ ʜᴀʀᴇ 𝗕𝗯𝘆 ᴅᴀᴋᴄʜɪꜱ ᴀᴍɪ ᴛᴏ ꜱᴏtti ʙᴀᴄᴄʜᴀ ʜᴏʏᴇ ᴊᴀʙᴏ_☹😑",
        "ᴋᴇᴍon ᴀꜱᴏ",
        "ꜱᴜɴᴏ ᴅʜᴏɪʀᴊᴏ ᴀʀ ꜱᴏʜᴊᴏ ᴊɪʙᴏɴᴇʀ ꜱᴏʙ😊🌻💜",
        "ɢᴏʟᴀᴘ ꜰᴜʟ ᴇʀ ᴊᴀʏɢᴀʏ ᴀᴍɪ ᴅɪʟᴀᴍ ᴛᴏᴍᴀʏ msg°",
        "ᴋoᴛʜᴀ ᴅᴇᴏ ᴀᴍᴀᴋᴇ ᴘᴏᴛᴀʙᴀ...!!😌",
        "ᴇᴍʙɪ ᴋɪɴᴇ ᴅᴇᴏ ɴᴀ_🥺🥺",
        "ɢꜰ ʙʜᴇʙᴇ ᴇᴋᴛᴜ ꜱʜᴀꜱᴏɴ ᴋᴏʀᴇ ᴊᴀᴏ!🐸",
        "ɢᴏʀᴜ ᴜᴅᴅᴇ ᴀᴋᴀꜱʜᴇ ꜱᴀʟᴀᴍɪ ᴘᴀᴛʜᴀɴ ʙɪᴋᴀꜱʜᴇ 💸💰",
        "ʙᴏʟᴇɴ _😌",
        "ʙᴀʀ ʙᴀʀ ᴅɪꜱᴛᴜʀʙ ᴋᴏʀᴇᴄʜɪꜱ ᴋɴᴏ😾,",
        "ᴀᴍᴀʀ ᴊᴀɴᴜ ᴇʀ ꜱᴀᴛʜᴇ ʙʏᴀꜱᴛᴏ ᴀꜱɪ😋-",
        "ᴄʜᴏᴜᴅʜᴜʀɪ ꜱᴀʜᴇʙ ᴀᴍɪ ɢᴏʀɪʙ ʜᴏᴛᴇ ᴘᴀʀɪ.😾🤭 ᴋɪɴᴛᴜ-ʙᴏʀᴏʟᴏᴋ ɴᴀ.🥹😫",
        "ᴀʀ ᴀᴋʙᴀʀ ʙᴀʙʏ ʙᴏʟʟᴇ ᴅᴇɪᴋʜᴏ ᴛᴏᴍᴀʀ 1 ᴅɪɴ  ɴᴀᴋɪ ᴀᴍʀ 10 ᴅɪɴ😒",
        "ᴋɪ ´･ᴗ･`",
        "ᴋɪ ʜᴏʟᴏ ,ᴍɪꜱ ᴛɪꜱ ᴋᴏʀᴄᴄʜɪꜱ ɴᴀᴋɪ🤣",
        "ᴋᴀᴄʜᴇ ᴀꜱᴏ ᴋᴏᴛʜᴀ ᴀꜱᴇ",
        "ᴀᴍ ɢᴀᴄʜᴇ ᴀᴍ ɴᴀɪ ᴅʜɪʟ ᴋᴇɴᴏ ᴍᴀʀᴏ, ᴛᴏᴍᴀʀ ꜱᴀᴛʜᴇ ᴘʀᴇᴍ ɴᴀɪ ʙᴇʙʏ ᴋᴇɴᴏ ᴅᴀᴋᴏ",
        "ᴀɢᴇ ᴇᴋᴛᴀ ɢᴀɴ ʙᴏʟᴏ,☹ɴᴀʜᴏʟᴇ ᴋᴏᴛʜᴀ ʙᴏʟʙᴏ ɴᴀ_🥺",
        "ᴀᴄᴄʜᴀ ꜱʜᴜɴᴏ_😒",
        "𝗕𝗯𝘆 ɴᴀ ᴊᴀɴᴜ,ʙᴏʟ 😌",
        "ʟᴜɴɢɪ ᴛᴀ ᴅʜᴏʀ ᴍᴜᴛᴇ ᴀꜱɪ🙊🙉",
        "ᴛᴏᴍᴀᴋᴇ ꜱᴀʀᴀ ᴀᴍɪ ʙᴀᴄʜᴍᴜ ɴᴀ ʙᴀʙʏ",
        "ᴛᴏᴍᴀʀ ʟᴀɴɢ ᴋᴇᴍᴏɴ ᴀꜱᴇ?",
        "ᴛᴜᴍɪ ᴇᴛᴏ ʙʙʏ ɴᴀ ᴅᴇᴋᴇ ʙᴏᴜ ᴅᴀᴋᴏ",
        "ᴍɪꜱꜱ ᴋᴏʀꜱᴇʟᴀ ?",
        "ᴏɪ ᴍᴀᴍᴀ ᴀʀ ᴅᴀᴋɪꜱ ɴᴀ ᴘʟɪᴢ",
        "ᴀᴍᴀᴋᴇ ɴᴀ ᴅᴇᴋʜᴇ ᴇᴋᴛᴜ ᴘᴏʀᴏᴛᴇᴏ ʙᴏꜱʜᴛᴇ ᴛᴏ ᴘᴀʀᴏ🥺🥺",
        "𝗕𝗯𝘆 ʙᴏʟᴇ ᴏꜱʜᴏᴍᴍᴀɴ ᴋᴏʀᴄᴄʜɪꜱ,😰😿",
        "ᴍᴇꜱꜱᴀɢᴇ ɴᴀ ᴅɪʏᴇ ᴛᴏ ᴛᴇᴀᴄʜ ᴀᴡ ᴅɪᴛᴇ ᴘᴀʀᴏ ᴛᴀʏ ɴᴀ?",
        "ᴀᴊ ᴇᴋᴛᴀ ꜰᴏɴ ɴᴀɪ ʙᴏʟᴇ ʀɪᴘʟᴀʏ ᴅɪᴛᴇ ᴘᴀʀʟᴀᴍ ɴᴀ_🙄",
        "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        return message.reply(reply, (err, info) => {
          if (!err) global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
        });
      }

      // যদি “baby [text]” হয়
      const prefixes = ["baby ", "bot ", "বেবি ", "বট ", "jan"];
      const prefix = prefixes.find(p => raw.startsWith(p));
      if (prefix) {
        const query = raw.replace(prefix, "").trim();
        if (!query) return;
        await sendTyping();
        const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
        const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

        if (!responses || responses.length === 0) {
          console.log(`🧠 Auto-learned: "${query}"`);
          await axios.get(`${simsim}/teach?ask=${encodeURIComponent(query)}&ans=${encodeURIComponent("hmm baby 😚 (auto learned)")}&senderName=${encodeURIComponent(senderName)}`);
          return message.reply("😚");
        }

        for (const reply of responses) {
          await new Promise((resolve) => {
            message.reply(reply, (err, info) => {
              if (!err) global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
              resolve();
            });
          });
        }
      }
    } catch (err) {
      console.error("❌ Baby onChat error:", err);
    }
  }
};
