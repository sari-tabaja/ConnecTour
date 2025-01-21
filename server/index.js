const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');
const flightRoutes = require('./routes/flights');
const bookingRoutes = require('./routes/bookings');
const flightTravelRoadRoutes = require('./routes/flightTravelRoad');
const placesRoutes = require('./routes/places'); // Import the new route


const app = express();

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb+srv://connectour:Asd12345@connectour.qlmk1j2.mongodb.net/?retryWrites=true&w=majority&appName=ConnecTour';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/flight-travel-road', flightTravelRoadRoutes);
app.use('/api/places', placesRoutes); // Use places route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
