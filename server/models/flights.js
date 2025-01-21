const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: String,
  tripType: { type: String, enum: ['one-way', 'round-trip'] },
  from: {
    country: String,
    town: String
  },
  to: {
    country: String,
    town: String
  },
  departure: Date,
  arrival: Date,
  returnDeparture: Date,
  returnArrival: Date,
  price: Number,
  stopovers: [
    {
      stopoverTown: String,
      stopoverCountry: String,
      arrival: Date,
      departure: Date
    }
  ]
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
