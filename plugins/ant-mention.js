const { cmd } = require('../command');

// Memory to track Anti-Mention ON/OFF per group
let antiMentionStatus = {}; // { groupId: true/false }

// Command to toggle anti-mention
cmd({
    pattern: "antimention",
    alias: ["antitag", "nomention"],
    desc: "Enable/Disable anti-mention feature.",
    react: "🚫",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, groupAdmins, senderNumber, reply }) => {
    try {
        if (!isGroup) return reply("This command can only be used in groups.");
        if (!groupAdmins.includes(senderNumber + "@s.whatsapp.net")) {
            return reply("Only group admins can use this command.");
        }

        antiMentionStatus[from] = !antiMentionStatus[from];
        const status = antiMentionStatus[from] ? "ENABLED" : "DISABLED";

        // Fetch group metadata for group name
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject || "this group";

        reply(`🔒 Anti-Mention in *${groupName}* is now *${status}*.`);
    } catch (e) {
        console.error("Error toggling anti-mention:", e);
        reply("An error occurred while toggling anti-mention.");
    }
});

// Command to check Anti-Mention status
cmd({
    pattern: "antimentionstatus",
    alias: ["antimentioncheck", "antimentionstate"],
    desc: "Check if Anti-Mention is enabled or disabled in this group.",
    react: "ℹ️",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("This command can only be used in groups.");

        const status = antiMentionStatus[from] ? "ENABLED" : "DISABLED";

        // Fetch group metadata for group name
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject || "this group";

        reply(`ℹ️ Anti-Mention in *${groupName}* is currently *${status}*.`);
    } catch (e) {
        console.error("Error checking anti-mention status:", e);
        reply("An error occurred while checking Anti-Mention status.");
    }
});

// Listener to detect mentions
async function antiMentionHandler(conn, m) {
    try {
        const from = m.key.remoteJid;
        if (!from || !antiMentionStatus[from]) return; // Run only if enabled

        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            const mentions = m.message.extendedTextMessage.contextInfo.mentionedJid;
            const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
            const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net"; // owner number

            if (mentions.includes(botJid)) {
                const user = m.key.participant || m.participant;

                // Fetch group metadata to check admins
                const groupMetadata = await conn.groupMetadata(from);
                const adminList = groupMetadata.participants
                    .filter(p => p.admin)
                    .map(p => p.id);

                if (adminList.includes(user) || user === botOwner) {
                    // Admin or owner mentioned bot
                    await conn.sendMessage(from, { 
                        text: `ℹ️ @${user.split("@")[0]} can mention the bot freely 😅.` 
                    }, { mentions: [user] });
                } else {
                    // Normal member mentioned bot → remove
                    await conn.sendMessage(from, { 
                        text: `⛔ @${user.split("@")[0]} mentioned the bot and has been removed from the group!` 
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
