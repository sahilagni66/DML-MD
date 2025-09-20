const { cmd } = require('../command');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Memory to track warnings and toggle
let antiMentionStatus = {}; // { groupId: true/false }
let mentionWarnings = {};   // { groupId: { userId: count } }

// Command to toggle anti-mention
cmd({
    pattern: "antimention",
    alias: ["antitag", "nomention"],
    desc: "Enable/Disable anti-mention feature.",
    react: "🚫",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, isBotAdmins, senderNumber, groupAdmins, reply }) => {
    try {
        if (!isGroup) return reply("This command can only be used in groups.");
        if (!groupAdmins.includes(senderNumber + "@s.whatsapp.net")) {
            return reply("Only group admins can use this command.");
        }

        if (!antiMentionStatus[from]) {
            antiMentionStatus[from] = true;
            return reply("✅ Anti-Mention has been ENABLED in this group.");
        } else {
            antiMentionStatus[from] = false;
            return reply("❌ Anti-Mention has been DISABLED in this group.");
        }
    } catch (e) {
        console.error("Error toggling anti-mention:", e);
        reply("An error occurred while toggling anti-mention.");
    }
});

// Listener to detect mentions
async function antiMentionHandler(conn, m) {
    try {
        const from = m.key.remoteJid;
        if (!from || !antiMentionStatus[from]) return; // Only run if enabled

        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            const mentions = m.message.extendedTextMessage.contextInfo.mentionedJid;
            const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";

            if (mentions.includes(botJid)) {
                const user = m.key.participant || m.participant;
                if (!mentionWarnings[from]) mentionWarnings[from] = {};
                if (!mentionWarnings[from][user]) mentionWarnings[from][user] = 0;

                mentionWarnings[from][user]++;

                if (mentionWarnings[from][user] === 1) {
                    await conn.sendMessage(from, { text: `⚠️ @${user.split("@")[0]}, do not mention the bot in this group. (1/2 warnings)` }, { quoted: m, mentions: [user] });
                } else if (mentionWarnings[from][user] === 2) {
                    await conn.sendMessage(from, { text: `⚠️ @${user.split("@")[0]}, second warning! Next time you will be removed. (2/2 warnings)` }, { quoted: m, mentions: [user] });
                } else if (mentionWarnings[from][user] >= 3) {
                    if (await isBotAdmin(conn, from)) {
                        await conn.sendMessage(from, { text: `⛔ @${user.split("@")[0]} has been removed for repeatedly mentioning the bot.` }, { mentions: [user] });
                        await conn.groupParticipantsUpdate(from, [user], "remove");
                    }
                    delete mentionWarnings[from][user]; // Reset after removal
                }
            }
        }
    } catch (e) {
        console.error("Error in anti-mention handler:", e);
    }
}

// Helper to check bot admin
async function isBotAdmin(conn, from) {
    try {
        const groupMetadata = await conn.groupMetadata(from);
        const admins = groupMetadata.participants.filter(p => p.admin);
        return admins.some(a => a.id === conn.user.id);
    } catch {
        return false;
    }
}

module.exports = { antiMentionHandler };
