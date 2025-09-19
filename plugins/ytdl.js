const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    const regex = /(?:youtube.com\/(?:.*v=|.*\/)|youtu.be\/|youtube.com\/embed\/|youtube.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "play",
    alias: ["mp3", "ytmp3"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".song ",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or Youtube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;
        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            id = searchResults.results[0].videoId;
        }

        const data = await dy_scrap.ytsearch(`[https://youtube.com/watch?v=${id}](https://youtube.com/watch?v=${id})`);
        if (!data?.results?.length) return await reply("❌ Failed to fetch video!");

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        // Newsletter text only
        const newsletterCaption = `🇹🇿 *DML-MD DOWNLOADER* \n\n` +
            `🎵 *Title:* ${title || "Unknown"}\n` +
            `⏳ *Duration:* ${timestamp || "Unknown"}\n` +
            `👀 *Views:* ${views || "Unknown"}\n` +
            `🌏 *Release Ago:* ${ago || "Unknown"}\n` +
            `👤 *Author:* ${author?.name || "Unknown"}\n` +
            `🖇 *Url:* ${url || "Unknown"}\n\n` +
            `🔽 *Reply with your choice:*\n` +
            `1 *Audio Type* 🎵\n` +
            `2 *Document Type* 📁\n\n` +
            `💌 *View Channel:* https://whatsapp.com/channel/0029Vb2hoPpDZ4Lb3mSkVI3C\n\n` +
            `${config.FOOTER || "DML-PLAY"}`;

        // Send newsletter as text only
        const sentMsg = await conn.sendMessage(from, { 
            text: newsletterCaption,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363387497418815@newsletter',
                    newsletterName: '『 DML-TECH 』',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // Listen for user reply
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();
                let type;

                if (userReply === "1") {
                    await conn.sendMessage(from, { text: "⏳ Processing..." }, { quoted: mek });
                    const response = await dy_scrap.ytmp3(`[https://youtube.com/watch?v=${id}](https://youtube.com/watch?v=${id})`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    
                    // Send audio with song thumbnail
                    type = {
                        audio: { url: downloadUrl },
                        mimetype: "audio/mpeg",
                        fileName: `${title}.mp3`,
                        contextInfo: {
                            externalAdReply: {
                                title: title,
                                body: `🎶 ${author?.name || "Unknown"}`,
                                mediaUrl: url,
                                mediaType: 2,
                                thumbnail: image
                            }
                        }
                    };
                } else if (userReply === "2") {
                    await conn.sendMessage(from, { text: "⏳ Processing..." }, { quoted: mek });
                    const response = await dy_scrap.ytmp3(`[https://youtube.com/watch?v=${id}](https://youtube.com/watch?v=${id})`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    
                    // Send document with song thumbnail as preview
                    type = {
                        document: { url: downloadUrl, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title },
                        contextInfo: {
                            externalAdReply: {
                                title: title,
                                body: `🎶 ${author?.name || "Unknown"}`,
                                mediaUrl: url,
                                mediaType: 2,
                                thumbnail: image
                            }
                        }
                    };
                } else {
                    return await reply("❌ Invalid choice! Reply with 1 or 2");
                }

                await conn.sendMessage(from, type, { quoted: mek });
            } catch (error) {
                console.error(error);
                await reply(`❌ *An error occurred while processing:* ${error.message || "Error!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});
