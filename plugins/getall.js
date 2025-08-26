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

        if (type === "members" || type === "member") {
            if (!isGroup) return reply("❌ This command only works in groups.");
            const groupInfo = await conn.groupMetadata(from).catch(() => null);
            if (!groupInfo) return reply("❌ Failed to fetch group info.");

            let members = groupInfo.participants || [];
            for (let i of members) {
                str += `📍 ${i.id}\n`;
            }

            if (str) {
                // Normal reply with members
                await reply(`*「 LIST OF GROUP MEMBERS 」*\n\n${str}\n└──✪ DML ┃ MD ✪──`);

                // Also send forwarded channel-style message
                await conn.sendMessage(from, {
                    text: `*「 CHANNEL VIEW 」*\n\n${str}`,
                    contextInfo: {
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363387497418815@newsletter',
                            serverMessageId: null,
                            newsletterName: "DML ┃ MD CHANNEL"
                        }
                    }
                }, { quoted: mek });

            } else {
                reply("❌ No members found!");
            }

        } else if (type === "user" || type === "pm" || type === "pc" || type === "users") {
            let anu = store.chats.all()
                .filter(v => v.id.endsWith('.net'))
                .map(v => v);

            for (let i of anu) {
                str += `📍 ${i.id}\n`;
            }

            str ? reply(`*「 LIST OF PERSONAL CHAT JIDS 」*\n\nTotal: ${anu.length}\n\n${str}\n└──🔴 DML ┃ MD 🔴──`)
                : reply("❌ No PM chats found!");

        } else if (type === "group" || type === "groups" || type === "gc") {
            let groups = await conn.groupFetchAllParticipating();
            const gList = Object.values(groups);

            for (let g of gList.map(t => t.id)) {
                str += `📍 ${g}\n`;
            }

            str ? reply(`*「 LIST OF GROUP CHAT JIDS 」*\n\n${str}\n└──🔴 DML ┃ MD 🔴──`)
                : reply("❌ No group chats found!");

        } else {
            return reply(`⚠️ Use: ${prefix}getall members | users | groups`);
        }
    } catch (e) {
        console.error("GetAll Error:", e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});
