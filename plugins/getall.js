const config = require('../config')
const { cmd } = require('../command')
const { prefix } = require('../lib/functions')

cmd({
pattern: "getall",
react: "📋",
alias: ["getjids", "fetchall"],
desc: "Get JIDs of group members / PM chats / all groups.",
category: "owner",
use: ".getall [members | users | groups]",
filename: __filename,
fromMe: true
},
async (conn, mek, m, { from, participants, reply, isGroup, args, store }) => {
try {
let str = "";
let type = (args[0] || "").toLowerCase();

// 🔹 GET MEMBERS  
    if (type === "members" || type === "member") {  
        if (!isGroup) return reply("❌ This command only works in groups.");  
        const groupInfo = await conn.groupMetadata(from).catch(() => null);  
        if (!groupInfo) return reply("❌ Failed to fetch group info.");  

        let members = groupInfo.participants || [];  
        for (let i of members) {  
            str += `📍 ${i.id}\n`;  
        }  

        if (!str) return reply("❌ No members found!");  

        await conn.sendMessage(from, {  
            text: `*「 LIST OF GROUP MEMBERS 」*\n\n${str}\n└──🔴 DML ┃ MD 🔴──`,  
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
        }, { quoted: mek });  

    // 🔹 GET USERS  
    } else if (type === "user" || type === "pm" || type === "pc" || type === "users") {  
        let chats = store.chats.all();  
        let anu = chats.filter(v => v.id && v.id.endsWith("@s.whatsapp.net"));  

        for (let i of anu) {  
            str += `📍 ${i.id}\n`;  
        }  

        if (!str) return reply("❌ No personal chats found!");  

        await conn.sendMessage(from, {  
            text: `*「 LIST OF PERSONAL CHAT JIDS 」*\n\nTotal: ${anu.length}\n\n${str}\n└──🔴 DML ┃ MD 🔴──`,  
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
        }, { quoted: mek });  

    // 🔹 GET GROUPS  
    } else if (type === "group" || type === "groups" || type === "gc") {  
        let groups = await conn.groupFetchAllParticipating();  
        const gList = Object.values(groups);  

        for (let g of gList.map(t => t.id)) {  
            str += `📍 ${g}\n`;  
        }  

        if (!str) return reply("❌ No group chats found!");  

        await conn.sendMessage(from, {  
            text: `*「 LIST OF GROUP CHAT JIDS 」*\n\n${str}\n└──🔴 DML ┃ MD 🔴──`,  
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
        }, { quoted: mek });  

    } else {  
        return reply(`⚠️ Use: ${prefix}getall members | users | groups`);  
    }  

} catch (e) {  
    console.error("GetAll Error:", e);  
    reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);  
}

});

