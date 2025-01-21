const express = require('express');
const router = express.Router();
const axios = require('axios');

const googleApiKey = 'AIzaSyAQkTDQzW_r0WCWvEv-dqFLo5re25UTyqY'; // Your Google API Key

router.get('/map', async (req, res) => {
    const { pathPoints, markers } = req.query;

    try {
        const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap?';
        const params = new URLSearchParams({
            key: googleApiKey,
            size: '600x300',
            maptype: 'roadmap',
            markers: markers.join('&markers='),
            path: `color:0x0000ff|weight:5|${pathPoints.join('|')}`
        });

        const mapUrl = `${baseUrl}${params.toString()}`;
        res.json({ mapUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate the map' });
    }
});

module.exports = router;
