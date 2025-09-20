// antiMention.js
async function antiMentionHandler(conn, m) {
    try {
        const from = m.key.remoteJid;
        if (!from) return;

        // Check if message has mentions
        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            const mentions = m.message.extendedTextMessage.contextInfo.mentionedJid;
            const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
            const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net"; // Your number

            if (mentions.includes(botJid)) {
                const user = m.key.participant || m.participant;

                // Fetch group metadata
                const groupMetadata = await conn.groupMetadata(from);
                const groupName = groupMetadata.subject || "this group";

                // Admins list
                const adminList = groupMetadata.participants
                    .filter(p => p.admin)
                    .map(p => p.id);

                if (adminList.includes(user) || user === botOwner) {
                    // Admin/Owner mention → ignore
                    await conn.sendMessage(from, { 
                        text: `ℹ️ @${user.split("@")[0]} mentioned the bot in *${groupName}* but is safe (admin/owner).` 
                    }, { mentions: [user] });
                } else {
                    // Member mentioned bot → remove instantly
                    await conn.sendMessage(from, { 
                        text: `⛔ @${user.split("@")[0]} mentioned the bot in *${groupName}* and has been removed!` 
                    }, { mentions: [user] });

                    await conn.groupParticipantsUpdate(from, [user], "remove");
                }
            }
        }
    } catch (e) {
        console.error("❌ Error in antiMentionHandler:", e);
    }
}

module.exports = { antiMentionHandler };
