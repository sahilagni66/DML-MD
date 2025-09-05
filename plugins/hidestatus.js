const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");

cmd({
    pattern: "hidestatus",
    react: "👀",
    desc: "Download/view status without appearing in the viewed list.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        // Fetch all status updates (contacts in your groups)
        const statuses = await conn.fetchStatus(); // pseudo method; may vary based on your bot framework

        if (!statuses || statuses.length === 0) {
            return reply("❌ No status available to view.");
        }

        // Loop through each status
        for (let status of statuses) {
            try {
                const mediaBuffer = await conn.downloadMedia(status); // download media without marking viewed
                const fileName = path.join(__dirname, `status_${status.id}.jpg`);

                fs.writeFileSync(fileName, mediaBuffer); // save locally (optional)

                // Send to chat without marking as viewed
                await conn.sendMessage(m.chat, {
                    image: mediaBuffer,
                    caption: `👀 Hidden Status from: ${status.senderName || status.sender}`
                });
            } catch (err) {
                console.error("Failed to download/send a status:", err);
            }
        }

        reply("✅ All available statuses have been downloaded/viewed secretly.");

    } catch (e) {
        console.error("Error in hidestatus command:", e);
        reply("❌ Failed to fetch statuses. Make sure the bot has access to the group contacts.");
    }
});
