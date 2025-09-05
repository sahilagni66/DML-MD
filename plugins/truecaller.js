const axios = require("axios");
const { cmd } = require("../command");

let numberCache = {};

cmd({
    pattern: "getname",
    react: "🔎",
    desc: "Get Truecaller-style lookup with profile picture (if available).",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return reply("❌ Please provide a phone number.\n👉 Example: /getname +255712345678");

        const num = q.replace(/[\s()-]/g, "");

        if (numberCache[num]) return reply(numberCache[num]);

        // Format JID for WhatsApp
        const jid = num.includes("@") ? num : num + "@s.whatsapp.net";

        // Try fetching profile picture
        let profilePic = null;
        try {
            profilePic = await conn.profilePictureUrl(jid).catch(() => null);
        } catch { profilePic = null; }

        // Use number as default name
        let contactName = num;
        try {
            const waContact = await conn.onWhatsApp(jid);
            if (waContact?.length > 0) contactName = waContact[0]?.notify || num;
        } catch {}

        // Call Numverify API
        const apiKey = "5fae6e0f3e530c6e638b6b924c6fddd3";
        const url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${encodeURIComponent(num)}`;
        const res = await axios.get(url);
        const data = res.data;

        let msg = `🕵️‍♂️ *Phone Lookup Result* 🕵️‍♂️\n\n`;
        msg += `👤 Name: ${contactName}\n`;
        msg += `📞 Number: ${num}\n`;
        msg += `✅ Valid: ${data.valid ? "Yes" : "No"}\n`;
        msg += `🌍 Country: ${data.country_name || "Unknown"} (${data.country_code || "-"})\n`;
        msg += `📍 Location: ${data.location || "Unknown"}\n`;
        msg += `📡 Carrier: ${data.carrier || "Unknown"}\n`;
        msg += `📱 Line Type: ${data.line_type || "Unknown"}\n`;

        // Send profile picture if exists
        if (profilePic) {
            await conn.sendMessage(m.chat, {
                image: { url: profilePic },
                caption: msg
            });
        } else {
            await reply(msg);
        }

        numberCache[num] = msg;

    } catch (e) {
        console.error("Error in getname:", e);
        reply("❌ Failed to fetch number details. Please check your API or try again.");
    }
});
