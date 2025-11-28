const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "blur",
    version: "1.3",
    author: "SIFAT",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Apply adjustable blur to profile picture or image reply"
    },
    description: {
      en: "Adds a blur effect to your or mentioned user's profile picture, or any replied image, with optional intensity."
    },
    category: "edit",
    guide: {
      en: "{p}blur [amount] [@mention or reply]\nExample: {p}blur 5\nIf replying to an image, it will blur that image.\nDefault amount is 2."
    }
  },

  onStart: async function ({ api, event, message, args }) {
    const { senderID, mentions, type, messageReply, attachments } = event;

    // 1️⃣ Determine blur intensity (1-10)
    let amount = 2; // default
    if (args[0] && !isNaN(args[0])) {
      amount = Math.max(1, Math.min(10, parseInt(args[0])));
    }

    let imageURL;

    // 2️⃣ If replying to an image
    if (type === "message_reply" && messageReply.attachments?.length > 0 && messageReply.attachments[0].type === "photo") {
      imageURL = messageReply.attachments[0].url;
    }
    // 3️⃣ If user mentions someone
    else if (Object.keys(mentions).length > 0) {
      const uid = Object.keys(mentions)[0];
      imageURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;
    }
    // 4️⃣ Default: sender's profile picture
    else {
      imageURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;
    }

    try {
      const res = await axios.get(`https://api.popcat.xyz/v2/blur?image=${encodeURIComponent(imageURL)}&amount=${amount}`, {
        responseType: "arraybuffer"
      });

      const filePath = path.join(__dirname, "cache", `blur_${Date.now()}.png`);
      fs.writeFileSync(filePath, res.data);

      message.reply({
        body: `🐤 Here's your blurred image! (Intensity: ${amount})`,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply("| Failed to generate image.");
    }
  }
};
