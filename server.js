const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/track', async (req, res) => {
    const measurementId = 'G-2ZPVT8VYJT'; // Your specific Measurement ID
    const itemId = req.query.item_id;

    if (!measurementId) {
        return res.status(400).send('Measurement ID is required');
    }

    // Log the hit to Google Analytics
    try {
        await axios.post(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}`, {
            client_id: 'anon', // replace with a unique identifier if you have one
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
