const express = require('express');
const mongoose = require('mongoose');
const Flight = require('../models/flights');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const flights = await Flight.find();
    res.json(flights);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).send('Flight not found');
    res.json(flight);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
