const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 4000;

// Serve static files from the "public" directory
app.use(express.static('public'));

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

// Root route with Google Analytics tracking pixel
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Welcome to Outlytic</title>
                <!-- Link to the stylesheet -->
                <link rel="stylesheet" type="text/css" href="/styles.css">
                <!-- Global site tag (gtag.js) - Google Analytics -->
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-W1147JEP9M"></script>
                <script>
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-2ZPVT8VYJT');
                </script>
            </head>
            <body>
                <h1>Welcome to Outlytic</h1>
                <p>This is the root page of your Node.js application.</p>
                <p>Go to <a href="/status">Status Page</a> to check the server status.</p>
                <p>Go to <a href="/home">Homepage</a> to see the links to other pages.</p>
                <p>Go to <a href="/current-tags">Current Tags</a> to see all tracked tags.</p>
            </body>
        </html>
    `);
});

// Serve a status page with Google Analytics tracking pixel
app.get('/status', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <html>
            <head>
                <title>Tracking Server Status</title>
                <!-- Link to the stylesheet -->
                <link rel="stylesheet" type="text/css" href="/styles.css">
                <!-- Global site tag (gtag.js) - Google Analytics -->
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-W1147JEP9M"></script>
                <script>
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-2ZPVT8VYJT');
                </script>
            </head>
            <body>
                <h1>Tracking Server is Running!</h1>
                <p>The server is currently tracking the following item IDs:</p>
                <ul>
                    ${trackedItems.map(item => `<li>${item}</li>`).join('')}
                </ul>
                <p>Go back to <a href="/home">Homepage</a>.</p>
            </body>
        </html>
    `);
});

// Serve a homepage with links to other pages
app.get('/home', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Outlytic Homepage</title>
                <!-- Link to the stylesheet -->
                <link rel="stylesheet" type="text/css" href="/styles.css">
                <!-- Global site tag (gtag.js) - Google Analytics -->
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-W1147JEP9M"></script>
                <script>
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-2ZPVT8VYJT');
                </script>
            </head>
            <body>
                <h1>Outlytic Homepage</h1>
                <p>Welcome to the Outlytic homepage. Below are links to various pages:</p>
                <ul>
                    <li><a href="/">Root Page</a></li>
                    <li><a href="/status">Status Page</a></li>
                    <li><a href="/current-tags">Current Tags</a></li>
                </ul>
            </body>
        </html>
    `);
});

// Serve a current tags page with all tracked item IDs
app.get('/current-tags', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <html>
            <head>
                <title>Current Tags</title>
                <!-- Link to the stylesheet -->
                <link rel="stylesheet" type="text/css" href="/styles.css">
                <!-- Global site tag (gtag.js) - Google Analytics -->
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-W1147JEP9M"></script>
                <script>
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-2ZPVT8VYJT');
                </script>
            </head>
            <body>
                <h1>Current Tracked Item IDs</h1>
                <p>Below are the item IDs that have been tracked so far:</p>
                <ul>
                    ${trackedItems.map(item => `<li>${item}</li>`).join('')}
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
