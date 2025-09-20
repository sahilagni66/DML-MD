const { cmd } = require('../command');

// Listener: Always active Anti-Mention
async function antiMentionHandler(conn, m) {
    try {
        const from = m.key.remoteJid;
        if (!from) return;

        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            const mentions = m.message.extendedTextMessage.contextInfo.mentionedJid;
            const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
            const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net"; // Owner JID

            if (mentions.includes(botJid)) {
                const user = m.key.participant || m.participant;

                // Get group metadata
                const groupMetadata = await conn.groupMetadata(from);
                const groupName = groupMetadata.subject || "this group";

                // Get admin list
                const adminList = groupMetadata.participants
                    .filter(p => p.admin)
                    .map(p => p.id);

                if (adminList.includes(user) || user === botOwner) {
                    // Admin or owner mentioned bot
                    await conn.sendMessage(from, { 
                        text: `ℹ️ @${user.split("@")[0]} mentioned the bot in *${groupName}*, but is safe (admin/owner).` 
                    }, { mentions: [user] });
                } else {
                    // Normal member mentioned bot → remove immediately
                    await conn.sendMessage(from, { 
                        text: `⛔ @${user.split("@")[0]} mentioned the bot in *${groupName}* and has been removed!` 
                    }, { mentions: [user] });

                    await conn.groupParticipantsUpdate(from, [user], "remove");
                }
            }
        }
    } catch (e) {
        console.error("Error in anti-mention handler:", e);
    }
}

module.exports = { antiMentionHandler };
