const express = require('express');
const router = express.Router();
const axios = require('axios');

const RAPIDAPI_HOST = 'travel-advisor.p.rapidapi.com';
const RAPIDAPI_KEY = '593f17aef1mshb3a29398c2d4773p140722jsn9fd16bfac761'; // Replace with your actual API key

const fetchWithRetry = async (url, options, retries = 5, backoff = 200) => {
  try {
    const response = await axios.get(url, options);
    return response;
  } catch (error) {
    if (retries > 0 && error.response && error.response.status === 429) {
      console.log(`Retrying in ${backoff}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2); // Exponential backoff
    } else {
      throw error;
    }
  }
};

router.get('/fetch-data', async (req, res) => {
  const { lat, lng, radius } = req.query;
  const radiusInDegrees = radius / 111; // Convert radius from km to degrees

  try {
    const [attractionsResponse, restaurantsResponse] = await Promise.all([
      fetchWithRetry(`https://${RAPIDAPI_HOST}/attractions/list-in-boundary`, {
        params: {
          tr_longitude: parseFloat(lng) + radiusInDegrees,
          tr_latitude: parseFloat(lat) + radiusInDegrees,
          bl_longitude: parseFloat(lng) - radiusInDegrees,
          bl_latitude: parseFloat(lat) - radiusInDegrees,
          currency: 'USD',
          unit: 'km',
          lang: 'en_US',
        },
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      }),
      fetchWithRetry(`https://${RAPIDAPI_HOST}/restaurants/list-in-boundary`, {
        params: {
          tr_longitude: parseFloat(lng) + radiusInDegrees,
          tr_latitude: parseFloat(lat) + radiusInDegrees,
          bl_longitude: parseFloat(lng) - radiusInDegrees,
          bl_latitude: parseFloat(lat) - radiusInDegrees,
          restaurant_tagcategory_standalone: '10591',
          restaurant_tagcategory: '10591',
          limit: '30',
          currency: 'USD',
          open_now: 'false',
          lunit: 'km',
          lang: 'en_US',
        },
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      }),
    ]);

    const attractions = attractionsResponse.data.data;
    const restaurants = restaurantsResponse.data.data;

    res.json({ attractions, restaurants });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;


router.post('/stopover-locations', async (req, res) => {
    const { stopovers } = req.body;

    try {
        const stopoverLocations = await Promise.all(
            stopovers.map(async (stopover) => {
                const address = `${stopover.airport}, ${stopover.stopoverTown}, ${stopover.stopoverCountry}`;
                const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        address: address,
                        key: 'AIzaSyAQkTDQzW_r0WCWvEv-dqFLo5re25UTyqY'
                    }
                });

                if (response.data.status === 'OK' && response.data.results.length > 0) {
                    const location = response.data.results[0].geometry.location;
                    return {
                        lat: location.lat,
                        lng: location.lng,
                        name: address,
                        arrival: new Date(stopover.arrival).toISOString(),
                        departure: new Date(stopover.departure).toISOString()
                    };
                } else {
                    console.error('Geocoding API error:', response.data.status);
                    return null;
                }
            })
        );

        const validLocations = stopoverLocations.filter(location => location !== null);
        res.json(validLocations);
    } catch (error) {
        console.error('Error fetching stopover locations:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
