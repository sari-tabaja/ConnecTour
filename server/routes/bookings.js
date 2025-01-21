const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/bookings');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        console.log('Incoming booking request:', req.body); // Log the incoming request
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).send(booking);
    } catch (err) {
        console.error('Error saving booking:', err); // Log the error details
        res.status(500).send(err.message);
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }

        const bookings = await Booking.find({ userId }).populate('flightId').populate('userId');
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).send(err.message);
    }
});

module.exports = router;
