const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "getname",
    react: "🔎",
    desc: "Get details of a phone number (country, carrier, etc).",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) {
            return reply("❌ Please provide a phone number.\n👉 Example: /getname +255712345678");
        }

        // Replace with your Numverify API key
        const apiKey = "5fae6e0f3e530c6e638b6b924c6fddd3";
        const url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${encodeURIComponent(q)}`;

        const res = await axios.get(url);
        const data = res.data;

        if (!data.valid) {
            return reply("❌ Invalid or unknown number.");
        }

        let msg = `📞 *Phone Lookup Result* 📞\n\n`;
        msg += `➡️ Number: ${data.international_format || q}\n`;
        msg += `➡️ Country: ${data.country_name || "Unknown"} (${data.country_code || "-"})\n`;
        msg += `➡️ Location: ${data.location || "Unknown"}\n`;
        msg += `➡️ Carrier: ${data.carrier || "Unknown"}\n`;
        msg += `➡️ Line Type: ${data.line_type || "Unknown"}\n`;

        reply(msg);

    } catch (e) {
        console.error("Error in getname:", e);
        reply("❌ Failed to fetch number details. Please check your API or try again.");
    }
});
