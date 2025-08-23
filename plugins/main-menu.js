const config = require('../config')
const { cmd, commands } = require('../command');
const os = require("os")
const {runtime} = require('../lib/functions')
const fs = require("fs");
const path = require("path");

cmd({
    pattern: "menu",
    alias: ["allmenu","fullmenu"],
    use: '.menu2',
    desc: "Show all bot commands",
    category: "menu",
    react: "📜",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    const randomIndex = Math.floor(Math.random() * 10) + 1;
      const imagePath = path.join(__dirname, '..', 'Dml', `menu${randomIndex}.jpg`);
      const imageBuffer = fs.readFileSync(imagePath);
  
        let dec = ` ╭━━━〔 🚀 BOT INFORMATION 〕━━━╮
┃ 👑 Owner      : ${config.OWNER_NAME}
┃ ⚙️ Prefix     : [${config.PREFIX}]
┃ 🌐 Platform   : Heroku
┃ 📦 Version    : 4.0.0
┃ ⏱️ Runtime    : ${runtime(process.uptime())}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╔═══════════════════╗
║      🛠 DML LIST       ║
╚═══════════════════╝
🛑  gpt            🗣️ AI Chat
🛑 vv               🎥 Video
🛑 vv2             🎞️ Video 2
🛑 bible          📖 Scripture
🛑 channe l    📺 Channel Info
🛑 unblock     🔓 Unblock
🛑 block         🚫 Block
🛑 requestunban   ✅Whatsapp 
🛑 uptime      ⏱️ Status
🛑 gitclone     📂 Clone Repo
🛑 check        ✔️ Verify
🛑 ping          📡 Ping
🛑 pair           🔗 Link Accounts
🛑 owner       👑 Owner Info
🛑setpp         🤳🏻 Set Wa.dp
🛑 getpp        🖼️ Get Profile Pic
🛑 github       💻 GitHub
🛑 listonline   👥 Online Users
🛑 alive           ✅ Alive Check
🛑 menu         📋 Bot Menu
🛑 repo           📦 Repository
🛑 attp          ✏️ Text to Sticker
🛑 post         📝 Post Message
🛑 restart      🔄 Restart Bot
🛑 send         📤 Send Message
🛑 save          💾 Save Data
🛑 sticker      🖼️ Create Sticker
🛑 take          🎨 Take Action
🛑support     🇹🇿 Support channel

╔═══════════════════╗
║   ⬇️  DML DOWNLOAD  ⬇️  ║
╚═══════════════════╝
🖥 fb                📘 Facebook
🖥 play             ▶️ Play Store
🖥 apk              📱 APK Files
🖥 video           🎬 Video Download
🖥 img              🖼️ Image Download
🖥 tiktok          🎵 TikTok
🖥 fancy           🎨 Fancy Text
🖥 imgscan       🔍 Image Scan
🖥 stabilitya i   🤖 AI Tools
🖥 fluxai            🔄 AI Flux
🖥 lyrics           🎤 Lyrics
🖥 movie          🍿 Movies
🖥 screenshot   📸 Screenshot
🖥 rw                 🔄 Rewind
🖥 toppt           📈 Top Posts
🖥 tomp3          🎧 To MP3
🖥 short            ✂️ URL Shorten
🖥 convert        🔄 Convert Files
🖥 trt                ⏳ Translate
🖥 yts               🎥 YouTube Search
🖥 url                🔗 URL Tools

╔═══════════════════╗
║      👥 DML GROUP     ║
╚═══════════════════╝
🔴 gdesc         📝 Group Description
🔴 add             ➕ Add Member
🔴 kick             👢 Remove Member
🔴 hidetag       🤫 Hide Tag
🔴 tagall          📣 Tag Everyone
🔴 antilink       🚫 Anti-Link
🔴 welcome     🤗 Welcome Message
🔴 gname        🏷️ Group Name
🔴 ginfo           ℹ️ Group Info
🔴 join             🔗 Join Link
🔴 link             🔗 Group Link
🔴 vcfl            🎤 Voice Call Flag
🔴 vcf              👮🏻 Save for save
🔴 left            👋 Leave Group
🔴 mute          🔇 Mute Group
🔴 out             🚪 Leave
🔴 unmute       🔊 Unmute Group
🔴 newgc         🆕 New Group

╔═══════════════════╗
║     DML SETTINGS ⚙️   ║
╚═══════════════════╝
1️⃣ mode                               🔄 Mode Switch
2️⃣ auto                                 🤖 Auto Features
3️⃣ auto_typing  on/off        ⌨️ Typing Status
4️⃣ auto_react on/off            ❤️ Reactions
5️⃣ deletelink                        🗑️ Delete Links
6️⃣ antilink on/off                 🚫 Anti-Link
7️⃣ anticall on/off                 📅 Anti-Call
8️⃣ blocklist                           🚫 Block List

────────────────────────
💥 SPONSORED BY YOU 🫵🏻
════════════════════════

> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: imageBuffer,
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363387497418815@newsletter',
                        newsletterName: config.BOT_NAME,
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

      
        
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e}`);
    }
});
