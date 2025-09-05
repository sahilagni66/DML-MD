const axios = require("axios");
const { cmd } = require("../command");

let numberCache = {};

cmd({
    pattern: "getname",
    react: "🔎",
    desc: "Get a Truecaller-style lookup with profile picture.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { reply, q }) => {
    try {
        // ✅ React to the command
        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: "🔎",
                    key: m.key
                }
            });
        } catch(e) {
            console.log("Reaction failed:", e);
        }

        if (!q) return reply("❌ Please provide a phone number.\n👉 Example: /getname +255712345678");

        const num = q.replace(/[\s()-]/g, "");

        // Check cache
        if (numberCache[num]) return reply(numberCache[num]);

        // Default name and profile picture
        let contactName = num;
        let profilePic = null;

        // Try to get WhatsApp contact name and profile picture
        try {
            const jid = num.includes("@") ? num : num + "@s.whatsapp.net";
            const contact = await conn.onWhatsApp(jid);
            if (contact?.length > 0) contactName = contact[0]?.notify || num;

            profilePic = await conn.profilePictureUrl(jid).catch(() => null);
        } catch { /* ignore */ }

        // Call Numverify API
        const apiKey = "5fae6e0f3e530c6e638b6b924c6fddd3";
        const url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${encodeURIComponent(num)}`;
        const res = await axios.get(url);
        const data = res.data;

        // Build Truecaller-style info card
        let msg = `🕵️‍♂️ *Phone Lookup Result* 🕵️‍♂️\n\n`;
        msg += `👤 Name: ${contactName}\n`;
        msg += `📞 Number: ${num}\n`;
        msg += `✅ Valid: ${data.valid ? "Yes" : "No"}\n`;
        msg += `🌍 Country: ${data.country_name || "Unknown"} (${data.country_code || "-"})\n`;
        msg += `📍 Location: ${data.location || "Unknown"}\n`;
        msg += `📡 Carrier: ${data.carrier || "Unknown"}\n`;
        msg += `📱 Line Type: ${data.line_type || "Unknown"}\n`;

        // Send with profile picture if available
        if (profilePic) {
            await conn.sendMessage(m.chat, {
                image: { url: profilePic },
                caption: msg
            });
        } else {
            // Fallback to text if profile picture not found
            reply(msg);
        }

        // Cache the result
        numberCache[num] = msg;

    } catch (e) {
        console.error("Error in getname:", e);
        reply("❌ Failed to fetch number details. Please check your API or try again.");
    }
});
