const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "name",
    version: "1.0",
    author: "SIFAT",
    countDown: 3,
    role: 0,
    shortDescription: "Ephoto 1917 style text",
    longDescription: "Generate 1917 cinematic style text using Ephoto API",
    category: "name edt",
    guide: {
      en: "{pn} <text>"
    }
  },

  onStart: async function ({ api, event, args }) {

    const text = args.join(" ");
    if (!text) {
      return api.sendMessage(
        "Write text first.\n\nExample: name SIFAT",
        event.threadID,
        event.messageID
      );
    }

    const apiUrl = `https://mahbub-ullash.cyberbot.top/api/ephoto-1917?text=${encodeURIComponent(text)}`;

    try {
      const imgPath = path.join(__dirname, "/cache/1917.jpg");

      const { data } = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, data);

      api.sendMessage(
        {
          body: `🎀 : ${text}`,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        " Failed to generate image!",
        event.threadID,
        event.messageID
      );
    }
  }
};
