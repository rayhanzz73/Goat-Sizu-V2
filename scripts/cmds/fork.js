module.exports = {
  config: {
    name: "fork",
    aliases: ["repo", "source"],
    version: "1.0",
    author: "SiFu",
    countDown: 3,
    role: 0,
    longDescription: "Returns the link to the official, updated fork of the bot's repository.",
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function({ message }) {
    const text = "☠️ | Here is the updated fork:\n\nhttps:🍴🍴🍴\n\n" +
                 "\nEnhanced overall performance\n\n" +
                 "Keep supporting^_^";
    
    message.reply(text);
  }
};
