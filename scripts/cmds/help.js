const fs = require("fs-extra");
const path = require("path");
const https = require("https");

// --- Maps for fonts ---
const smallCapsMap = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ',
  g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ',
  m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
  y: 'ʏ', z: 'ᴢ'
};

const cmdFontMap = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ',
  i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ',
  q:'ǫ', r:'ʀ', s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ', '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴',
  '5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'
};

// --- Convert text to small caps ---
function toSmallCaps(text) {
  return text.toLowerCase().split('').map(c => smallCapsMap[c] || c).join('');
}

// --- Convert command to desired font ---
function toCmdFont(text) {
  return text.toLowerCase().split('').map(c => cmdFontMap[c] || c).join('');
}

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands", "cmd"],
    version: "6.0",
    author: "𝐒𝐈𝐅𝐀𝐓",
    shortDescription: "Show all available commands",
    longDescription: "Displays a categorized command list with a rotating video (different every time).",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    // --- Clean category name ---
    const cleanCategoryName = (text) => {
      if (!text) return "OTHERS";
      return text
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
    };

    // --- Organize commands by category ---
    for (const [name, cmd] of allCommands) {
      if (!cmd?.config || cmd.config.name === "help") continue;
      const cat = cleanCategoryName(cmd.config.category);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    // --- Video list ---
    const videoURLs = [
      "https://i.imgur.com/IudwgaP.mp4",
      "https://i.imgur.com/AMv8IqG.mp4",
      "https://i.imgur.com/xhFp4Rc.mp4",
      "https://i.imgur.com/EXar1VY.mp4",
      "https://i.imgur.com/vWigmIF.mp4",
      "https://i.imgur.com/V6Au0p4.mp4"
    ];

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const indexFile = path.join(cacheDir, "help_video_index.json");
    let index = 0;

    if (fs.existsSync(indexFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(indexFile));
        index = (data.index + 1) % videoURLs.length;
      } catch {
        index = 0;
      }
    }
    fs.writeFileSync(indexFile, JSON.stringify({ index }));

    const videoURL = videoURLs[index];
    const videoPath = path.join(cacheDir, `help_video_${index}.mp4`);

    if (!fs.existsSync(videoPath)) {
      try {
        await downloadFile(videoURL, videoPath);
      } catch (err) {
        console.error("Video download failed:", err);
        return message.reply("❌ Couldn't load help video.");
      }
    }

 // --- Specific command info ---
    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd =
        allCommands.get(query) ||
        [...allCommands.values()].find((c) => (c.config.aliases || []).includes(query));

      if (!cmd) {
        return message.reply(`❌ Command "${query}" not found.`);
      }

      const { name, version, author, guide, category, shortDescription, longDescription, aliases } = cmd.config;
      const desc = longDescription || shortDescription || "No description provided.";

      const usage = (typeof guide === "string" ? guide : "{pn}{name}")
        .replace(/{pn}/g, prefix)
        .replace(/{name}/g, name);

      const replyMsg =
        `╭─ ✨ Command Details\n` +
        `│\n` +
        `│ 𝗡𝗮𝗺𝗲: ${name}\n` +
        `│ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${category || "Uncategorized"}\n` +
        `│ 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
        `│ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${version || "1.0"}\n` +
        `│\n` +
        `│ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${desc}\n` +
        `│ 𝗨𝘀𝗮𝗴𝗲: ${usage}\n` +
        `│\n` +
        `╰────────────➤`;

      return message.reply({
        body: replyMsg,
        attachment: fs.createReadStream(videoPath)
      });
    }


    // --- Full help list ---
    if (!args[0]) {
      let msg = "┍━━━━━━━━━━━━━━━━━━━━◊\n┋  [〄✨ꜱɪᴊᴜᴋᴀ ʜᴇʟᴘ ᴍᴇɴᴜ✨〄]\n┕━━━━━━━━━━━━━━━━━━◊\n\n\n";
      const sortedCategories = Object.keys(categories).sort();

      for (const cat of sortedCategories) {
        if (categories[cat].length === 0) continue;

        msg += `╭━━━[ 📁 ${toSmallCaps(cat)} ]\n`;
        const commands = categories[cat].sort();
        for (let i = 0; i < commands.length; i += 2) {
          const cmd1 = toCmdFont(commands[i]);
          const cmd2 = commands[i + 1] ? toCmdFont(commands[i + 1]) : null;
          msg += cmd2 ? `┋〄 ${cmd1}   〄 ${cmd2}\n` : `┋〄 ${cmd1}\n`;
        }
        msg += `┕━━━━━━━━━━━━◊\n\n`;
      }

      const totalCommands = allCommands.size - 1;
      msg +=
        `┍━━━━━━━━━━━━━━━◊\n [🎀] ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅꜱ: ${totalCommands}\n` +
        ` [🔑] ᴘʀᴇꜰɪx: ${prefix}\n` +
        ` [👑] ᴏᴡɴᴇʀ: ꜱɪꜰᴜ \n┕━━━━━━━━━━━━━━━━◊`;

      return message.reply({
        body: msg,
        attachment: fs.createReadStream(videoPath)
      });
    }
  }
};

// --- Download Helper ---
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error(`Failed to download '${url}' (${res.statusCode})`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
            }
