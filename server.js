const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 4000;

// Path to the file where tracked items will be stored
const dataFilePath = 'trackedItems.json';

// Load tracked items from file on startup, handle empty or corrupt JSON
let trackedItems = [];
try {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        if (data) {
            trackedItems = JSON.parse(data);
        }
    }
} catch (error) {
    console.error("Error reading or parsing trackedItems.json, starting with an empty array.", error);
    trackedItems = [];
}

// Serve static files from the "public" directory
app.use(express.static('public'));

// Function to get eBay item details
async function getItemDetails(itemId) {
    const ebayUrl = `https://www.ebay.com/itm/${itemId}`;
    try {
        const response = await axios.get(ebayUrl);
        const $ = cheerio.load(response.data);

        // Scrape the title
        const title = $('.x-item-title__mainTitle .ux-textspans').text().trim();

        // Scrape the image URL
        const imageUrl = $('.ux-image-carousel-item img').first().attr('src');

        if (title && imageUrl) {
            return {
                title: title,
                link: ebayUrl,
                thumbnail: imageUrl
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching details for item ${itemId}:`, error);
        return null;
    }
}

// Validate item ID to ensure it is a correct eBay item ID
function isValidItemId(itemId) {
    return /^\d{12}$/.test(itemId.trim());
}

// Track page views
app.get('/track', async (req, res) => {
    const itemId = req.query.item_id;

    if (!itemId || !isValidItemId(itemId)) {
        return res.status(400).send('Valid 12-digit Item ID is required');
    }

    // Add the item ID to the tracked items list if not already present
    if (!trackedItems.includes(itemId)) {
        trackedItems.push(itemId);

        // Save the updated list to the file
        try {
            fs.writeFileSync(dataFilePath, JSON.stringify(trackedItems));
        } catch (error) {
            console.error('Error saving tracked items:', error);
        }
    }

    // Log the hit to Google Analytics
    try {
        await axios.post(`https://www.google-analytics.com/mp/collect?measurement_id=G-2ZPVT8VYJT`, {
            client_id: 'anon',
            events: [{
                name: 'page_view',
                params: {
                    item_id: itemId,
                    page_title: 'eBay Listing',
                    page_location: `https://www.ebay.com/itm/${itemId}`
                }
            }]
        });

        // Serve a 1x1 pixel image
        res.setHeader('Content-Type', 'image/gif');
        res.send(Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0xff, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x4c, 0x01, 0x00, 0x3b]));
    } catch (error) {
        console.error('Error logging to Google Analytics:', error);
        res.status(500).send('Error logging to Google Analytics');
    }
});

// Serve a page showing current tracked item IDs with links and thumbnails
app.get('/current-tags', async (req, res) => {
    let itemsHtml = '';

    for (const itemId of trackedItems) {
        const itemDetails = await getItemDetails(itemId);
        if (itemDetails) {
            itemsHtml += `
                <li>
                    <a href="${itemDetails.link}" target="_blank">
                        <img src="${itemDetails.thumbnail}" alt="${itemDetails.title}" width="50" height="50">
                        ${itemDetails.title}
                    </a>
                </li>
            `;
        } else {
            itemsHtml += `<li>${itemId} (details not available)</li>`;
        }
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <html>
            <head>
                <title>Current Tags</title>
                <!-- Link to the stylesheet -->
                <link rel="stylesheet" type="text/css" href="/styles.css">
            </head>
            <body>
                <h1>Current Tracked Item IDs</h1>
                <p>Below are the item IDs that have been tracked so far, with links to the eBay products and thumbnails:</p>
                <ul>
                    ${itemsHtml}
                </ul>
                <p>Go back to <a href="/home">Homepage</a>.</p>
            </body>
        </html>
    `);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
