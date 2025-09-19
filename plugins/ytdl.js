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
    alias: ["mp3", "ytmp3", "yt"],
    react: "🎵",
    desc: "Download YouTube Audio/Video",
    category: "download",
    use: ".play <Text or YT URL>",
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
            `2 *Document Type* 📁\n` +
            `3 *Video Type* 🎬\n\n` +
            `${config.FOOTER || "𓆩DML-PLAY𓆪"}`;

        const sentMsg = await conn.sendMessage(
            from,
            { image: { url: image }, caption: info },
            { quoted: mek }
        );
        const messageID = sentMsg.key.id;

        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // Listen once for user choice (audio/doc/video)
        conn.ev.once('messages.upsert', async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();

                // Show quality options
                if (userReply === "1") {
                    return await reply("🎵 Choose Audio Quality:\n\n1. 128kbps\n2. 320kbps");
                } else if (userReply === "2") {
                    return await reply("📁 Choose Document Quality:\n\n1. 128kbps\n2. 320kbps");
                } else if (userReply === "3") {
                    return await reply("🎬 Choose Video Quality:\n\n1. 360p\n2. 720p");
                } else {
                    return await reply("❌ Invalid choice! Reply with 1, 2 or 3");
                }

                // Listen again for quality choice
                conn.ev.once('messages.upsert', async (qualityUpdate) => {
                    try {
                        const qInfo = qualityUpdate?.messages[0];
                        if (!qInfo?.message) return;
                        const qualityChoice = qInfo?.message?.conversation || qInfo?.message?.extendedTextMessage?.text;
                        const qReply = qualityChoice.trim();

                        let response, downloadUrl, type;

                        // Audio (128 / 320 kbps)
                        if (userReply === "1" || userReply === "2") {
                            let quality = qReply === "2" ? "320kbps" : "128kbps";
                            let msg = await conn.sendMessage(from, { text: `⏳ Processing ${quality}...` }, { quoted: mek });
                            response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`, quality);
                            downloadUrl = response?.result?.download?.url;
                            if (!downloadUrl) return await reply("❌ Audio download link not found!");

                            if (userReply === "1") {
                                type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg" };
                            } else {
                                type = { document: { url: downloadUrl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title };
                            }
                        }

                        // Video (360p / 720p)
                        if (userReply === "3") {
                            let quality = qReply === "2" ? "720p" : "360p";
                            let msg = await conn.sendMessage(from, { text: `⏳ Processing ${quality} video...` }, { quoted: mek });
                            response = await dy_scrap.ytmp4(`https://youtube.com/watch?v=${id}`, quality);
                            downloadUrl = response?.result?.download?.url;
                            if (!downloadUrl) return await reply("❌ Video download link not found!");
                            type = { video: { url: downloadUrl }, mimetype: "video/mp4", caption: `${title} (${quality})` };
                        }

                        await conn.sendMessage(from, type, { quoted: mek });
                        await conn.sendMessage(from, { text: 'Dml Say ✅ Media Upload Successful' }, { quoted: mek });

                    } catch (error) {
                        console.error(error);
                        await reply(`❌ *Error while fetching quality:* ${error.message || "Unknown Error"}`);
                    }
                });
            } catch (error) {
                console.error(error);
                await reply(`❌ *Error while processing:* ${error.message || "Unknown Error"}`);
            }
        });

        // Final banner
        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/tjt2z2.jpg` },
                caption: "『 DML-TECH 』 — Enjoy your music & videos 🎶🎬",
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
