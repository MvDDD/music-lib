const axios = require('axios');

async function youtubeSearch(query) {
    try {
        const queryEncoded = encodeURIComponent(query);
        const url = `https://www.youtube.com/results?search_query=${queryEncoded}`;
        const response = await axios.get(url);

        if (!response.status === 200) {
            throw new Error('Network response was not ok');
        }

        const htmlText = response.data;

        // Find the index where the script starts with "var ytInitialData = "
        const startIndex = htmlText.indexOf('var ytInitialData = ');

        if (startIndex === -1) {
            throw new Error('Script tag not found');
        }

        // Trim the HTML text to start from the script tag
        const scriptHTML = htmlText.substring(startIndex);

        // Find the end index of the script tag
        const endIndex = scriptHTML.indexOf('</script>');

        if (endIndex === -1) {
            throw new Error('End of script tag not found');
        }

        // Extract the inner HTML of the script tag
        let data = scriptHTML.slice(0, endIndex);
        eval(data.split("[object")[0]);
        const jsonData = ytInitialData
        delete ytInitialData

        // Extract video results
        const videoResults = jsonData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
        // Map video results to the desired format
        const mappedResults = videoResults.map(video => {
            if ('videoRenderer' in video) {
                let video_renderer = video['videoRenderer'];
                let video_result = {
                    'name': video_renderer['title']['runs'][0]['text'],
                    'id': video_renderer['videoId'],
                    'url': `https://www.youtube.com/watch?v=${video_renderer['videoId']}`,
                    'uploader': video_renderer['shortBylineText']['runs'][0]['text']
                };
                return video_result;
            } else {
                return null;
            }
        });

        // Remove null items from mappedResults array
        const filteredResults = mappedResults.filter(item => item !== null);

        return filteredResults;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}


module.exports = youtubeSearch;
