const { antiMentionHandler } = require('./antiMention');

// Message listener
conn.ev.on("messages.upsert", async (msg) => {
    try {
        const m = msg.messages[0];
        if (!m.message) return;

        // Pass every message to antiMentionHandler
        await antiMentionHandler(conn, m);

    } catch (e) {
        console.error("❌ Error in messages.upsert:", e);
    }
});
