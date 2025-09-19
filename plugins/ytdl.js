const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "play",
    alias: ["mp3", "ytmp3"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or Youtube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;
        let video;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            video = searchResults.results[0];
            id = video.videoId;
        } else {
            const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
            if (!data?.results?.length) return await reply("❌ Failed to fetch video!");
            video = data.results[0];
        }

        const { url, title, image, timestamp, ago, views, author } = video;

        let info = `🇹🇿 *DML-MD DOWNLOADER* \n\n` +
            `🎵 *Title:* ${title || "Unknown"}\n` +
            `⏳ *Duration:* ${timestamp || "Unknown"}\n` +
            `👀 *Views:* ${views || "Unknown"}\n` +
            `🌏 *Release Ago:* ${ago || "Unknown"}\n` +
            `👤 *Author:* ${author?.name || "Unknown"}\n` +
            `🖇 *Url:* ${url || "Unknown"}\n\n` +
            `🔽 *Reply with your choice:*\n` +
            `1 *Audio Type* 🎵\n` +
            `2 *Document Type* 📁\n\n` +
            `${config.FOOTER || "𓆩DML-PLAY𓆪"}`;

        const sentMsg = await conn.sendMessage(
            from,
            { image: { url: image }, caption: info },
            { quoted: mek }
        );
        const messageID = sentMsg.key.id;

        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // Listen once only for user reply
        conn.ev.once('messages.upsert', async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();
                let msg;
                let type;
                let response;

                if (userReply === "1") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing..." }, { quoted: mek });
                    response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg" };

                } else if (userReply === "2") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing..." }, { quoted: mek });
                    response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    type = { document: { url: downloadUrl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title };

                } else {
                    return await reply("❌ Invalid choice! Reply with 1 or 2");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ Media Upload Successful' }, { quoted: mek });

            } catch (error) {
                console.error(error);
                await reply(`❌ *Error while processing:* ${error.message || "Unknown Error"}`);
            }
        });

        // Final banner (fixed dec issue)
        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/tjt2z2.jpg` },
                caption: "『 DML-TECH 』 — Enjoy your music 🎵",
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363387497418815@newsletter',
                        newsletterName: '『 DML-TECH 』',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});
