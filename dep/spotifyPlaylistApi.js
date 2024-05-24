const puppeteer = require('puppeteer');
async function getSpotifyPlaylist(url) {
    try {
        if (!url.includes("/embed/")) url = url.split("playlist").join("embed/playlist") + "?utm_source=generator"
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
                await page.goto(url);
                const jsonData = await page.evaluate(() => {
            const scriptElement = document.querySelector('script#__NEXT_DATA__[type="application/json"]');
            if (!scriptElement) {
                throw new Error('Script element not found in HTML content');
            }
            return JSON.parse(scriptElement.textContent);
        });
                const trackList = jsonData.props.pageProps.state.data.entity.trackList.map(track => ({
            title: track.title,
            artist: track.subtitle.split(","),
            duration: track.duration
        }));
        await browser.close();         return trackList;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}
module.exports = getSpotifyPlaylist;

