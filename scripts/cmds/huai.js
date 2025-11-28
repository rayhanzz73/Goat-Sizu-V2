const axios = require("axios");
const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "hu",
    aliases: ["huuu", "huuuu", "hehe"],
    version: "3.0.5",
    author: "SHIFAT",
    countDown: 15,
    role: 0,
    shortDescription: "Chat with DeepSeek AI or OpenAI (text or image)",
    longDescription: "Send a question or image to DeepSeek/OpenAI API and get a clean AI response.",
    category: "ai bby",
    guide: "{pn}deepseek <your question> or reply to an image.",
  },
};

let activeAIReplies = new Set();

// Get dynamic base API URL from GitHub
async function getBaseApiUrl() {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json"
    );
    if (!res.data.gpt) throw new Error("GPT API URL not found in GitHub content");
    return res.data.gpt.trim().replace(/\/+$/, "");
  } catch (e) {
    console.error("❌ Could not load API base from GitHub:", e.message);
    throw new Error("❌ API base URL not found on GitHub");
  }
}

// Typing indicator helper
async function showTypingFor(api, threadID, ms) {
  try {
    await api.sendTypingIndicatorV2(true, threadID);
    await new Promise((r) => setTimeout(r, ms));
    await api.sendTypingIndicatorV2(false, threadID);
  } catch (err) {
    console.log("⚠️ Typing indicator error:", err.message);
  }
}

// Fetch AI reply (text or image)
async function getAIReply(baseUrl, question, imageUrl) {
  let apiUrl = `${baseUrl}/mrx/gpt.php?ask=${encodeURIComponent(question)}`;
  if (imageUrl) apiUrl += `&img=${encodeURIComponent(imageUrl)}`;
  const res = await axios.get(apiUrl);
  return typeof res.data === "object"
    ? res.data.answer || JSON.stringify(res.data)
    : res.data || "⚠️ No response from API.";
}

// Process the user query
async function processQuestion(api, event, question) {
  const baseUrl = await getBaseApiUrl();
  const imageUrl =
    event.messageReply?.attachments?.[0]?.type === "photo"
      ? event.messageReply.attachments[0].url
      : null;

  // Typing indicator while waiting for API
  const typingPromise = showTypingFor(api, event.threadID, 4000);
  const replyPromise = getAIReply(baseUrl, question, imageUrl);

  await typingPromise;

  try {
    const reply = await replyPromise;
    const sentMsg = await api.sendMessage(reply, event.threadID);
    activeAIReplies.add(sentMsg.messageID);
  } catch (err) {
    console.error(err);
    await api.sendMessage("❌ Error contacting AI server.", event.threadID);
  }
}

// Command trigger
module.exports.onStart = async function ({ api, event, args, message }) {
  let question;
  const repliedMessage = event.messageReply;

  if (repliedMessage?.attachments?.[0]?.type === "photo") {
    question = repliedMessage.attachments[0].url;
    console.log("[DEEPSEEK_DEBUG] Image query from reply:", question);
  } else if (args.length > 0) {
    question = args.join(" ");
    console.log("[DEEPSEEK_DEBUG] Text query:", question);
  } else if (repliedMessage?.body) {
    question = repliedMessage.body;
    console.log("[DEEPSEEK_DEBUG] Text query from reply:", question);
  } else {
    return message.reply("🎀 𝑲𝑰 𝑯𝑶𝑰𝑪𝑯𝑬 𝑲𝑶...‽");
  }

  await processQuestion(api, event, question);
};

// Follow-up replies
module.exports.onReply = async function ({ api, event, message, Reply }) {
  if (!activeAIReplies.has(Reply.messageID)) return;
  if (event.senderID !== Reply.author) return;

  let newQuery;
  if (event.attachments?.[0]?.type === "photo") {
    newQuery = event.attachments[0].url;
  } else if (event.body) {
    newQuery = event.body;
  } else {
    return message.reply("🎀 𝑺𝑨𝑳𝑨 𝑨𝑴𝑰 𝑨𝑰 𝑴𝑨𝑵𝑼𝑺 𝑵𝑨 🦖");
  }

  await processQuestion(api, event, newQuery);
};

// Wrap module for no prefix
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
