const puppeteer = require("puppeteer");
const spotify = { "dismantle": require("./dep/spotifyPlaylistApi.js") }
const download = { "YoutubeURL": require("./dep/YoutubeDownloadApi.js") }
const search = require("./dep/youtubeSearchApi.js")
const fs = require("fs");
const WebSocket = require("ws");
const http = require("http");
const axios = require("axios");
const getIp = () => require('os').networkInterfaces()['Wi-Fi'].find(item => item.family === 'IPv4')?.address;

const ip = getIp()
const PORT = process.env.PORT || 3000;



const httpServer = http.createServer((req, res) => {
    let html = String(fs.readFileSync("spotify rip.html")).replace("your_server_address:port", `${ip}:${PORT}`)
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end( html, "utf-8");
});
const wss = new WebSocket.Server({ server: httpServer });

wss.on('connection', async (ws) => {
    console.log('WebSocket connection opened.');

    ws.on('message', async (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === "spotify") {
                const urlArray = spotify.dismantle(parsedMessage.url);
                ws.send(JSON.stringify({ "event": "started", "items":urlArray.length }));
                for (let index = 0; index < urlArray.length; index++) {
                    const item = urlArray[index];
                    const searchResult = await search(item.title + " " + item.artist + " lyrics");
                    const videoUrl = searchResult[0].url;
                    const youtubeDownloadResult = await download.YoutubeURL(videoUrl);
                    ws.send(JSON.stringify({ "data": youtubeDownloadResult, "index":index, "name":item.title}));
                }
                ws.send(JSON.stringify({ "event": "end" }));
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');
    });
});



httpServer.listen(PORT, ip, () => {
    console.log(`HTTP server running on https://${ip}:${PORT}`);
});
