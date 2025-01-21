const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    passportNumber: { type: String, required: true }
});

const bookingSchema = new mongoose.Schema({
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentDetails: {
        cardNumber: { type: String, required: true },
        expiryDate: { type: String, required: true },
        cvv: { type: String, required: true },
        cost: { type: Number, required: true }
    },
    passengerDetails: [passengerSchema]
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
