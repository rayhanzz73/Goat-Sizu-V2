const axios = require("axios");

module.exports = {
  config: {
    name: "drive",
    version: "1.0.0",
    author: "SIFAT",
    countDown: 5,
    role: 2,
    shortDescription: "Upload media to Google Drive",
    longDescription: "Reply to any video/image/audio or provide a direct media URL to upload it to Google Drive and get a shareable link.",
    category: "link gen",
  },

  onStart: async function ({ api, event, args }) {
    let inputUrl = null;

    // ✅ Get URL from replied attachment or argument
    if (event.messageReply?.attachments?.length > 0) {
      inputUrl = event.messageReply.attachments[0].url;
    } else if (args.length > 0) {
      inputUrl = args[0];
    }

    // ⚠️ If no URL provided
    if (!inputUrl) {
      return api.sendMessage(
        "| Please reply to a media file or provide a direct media URL!",
        event.threadID,
        event.messageID
      );
    }

    const apikey = "ArYAN";
    const apiURL = `https://aryan-xyz-google-drive.vercel.app/drive?url=${encodeURIComponent(inputUrl)}&apikey=${apikey}`;

    try {
      // 🔄 Uploading message
      await api.sendMessage("☁️ Uploading to Google Drive...", event.threadID);

      const res = await axios.get(apiURL);
      const data = res.data || {};
      const driveLink = data.driveLink || data.driveLIink;

      // ✅ On success
      if (driveLink) {
        return api.sendMessage(
          `🐤 Google Drive URL:\n${driveLink}`,
          event.threadID,
          event.messageID
        );
      }

      // ❌ On failure
      return api.sendMessage(
        `❌ | File upload failed!\n${data.error || "error occurred."}`,
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error("Google Drive Upload Error:", error.message);
      return api.sendMessage(
        "| Please try again!",
        event.threadID,
        event.messageID
      );
    }
  },
};
