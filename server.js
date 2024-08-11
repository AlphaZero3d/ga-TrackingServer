const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Store tracked item IDs
let trackedItems = [];

// Track page views
app.get('/track', async (req, res) => {
    const measurementId = 'G-2ZPVT8VYJT'; // Your specific Measurement ID
    const itemId = req.query.item_id;

    if (!itemId) {
        return res.status(400).send('Item ID is required');
    }

    // Add the item ID to the tracked items list
    if (!trackedItems.includes(itemId)) {
        trackedItems.push(itemId);
    }

    // Log the hit to Google Analytics
    try {
        await axios.post(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}`, {
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

// Serve a status page
app.get('/status', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <html>
            <head>
                <title>Tracking Server Status</title>
            </head>
            <body>
                <h1>Tracking Server is Running!</h1>
                <p>The server is currently tracking the following item IDs:</p>
                <ul>
                    ${trackedItems.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </body>
        </html>
    `);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
