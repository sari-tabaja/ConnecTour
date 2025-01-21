import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SearchBar.css';

const SearchBar = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tripType, setTripType] = useState('one-way');
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [flights, setFlights] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/flights');
        setFlights(response.data);
      } catch (error) {
        console.error('Error fetching flights:', error);
      }
    };

    fetchFlights();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/results', {
      state: { from, to, tripType, departureDate, returnDate },
    });
  };

  const filterOptions = (query) => {
    const options = flights.filter(flight =>
      flight.from.town.toLowerCase().includes(query.toLowerCase()) ||
      flight.to.town.toLowerCase().includes(query.toLowerCase())
    );
    const uniqueOptions = new Set();
    options.forEach(flight => {
      uniqueOptions.add(`${flight.from.town} (${flight.from.country})`);
      uniqueOptions.add(`${flight.to.town} (${flight.to.country})`);
    });
    return Array.from(uniqueOptions);
  };

  return (
    <div className="search-bar">
      <div className="search-bar-description">
      Where do you want to go?
      </div>
      <form onSubmit={handleSearch}>
        <div className="input-group">
          <i className="fas fa-plane-departure icon"></i>
          <input
            type="text"
            placeholder="From (City or Airport)"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            list="from-countries"
            required
          />
          <datalist id="from-countries">
            {filterOptions(from).map((option, index) => (
              <option key={index} value={option}></option>
            ))}
          </datalist>
        </div>
        <div className="input-group">
          <i className="fas fa-plane-arrival icon"></i>
          <input
            type="text"
            placeholder="To (City or Airport)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            list="to-countries"
            required
          />
          <datalist id="to-countries">
            {filterOptions(to).map((option, index) => (
              <option key={index} value={option}></option>
            ))}
          </datalist>
        </div>
        <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
          <option value="one-way">One-way</option>
          <option value="round-trip">Round-trip</option>
        </select>
        <div className="input-group">
          <i className="fas fa-calendar-alt icon"></i>
          <DatePicker
            selected={departureDate}
            onChange={(date) => setDepartureDate(date)}
            placeholderText="Departure Date"
            required
          />
        </div>
        {tripType === 'round-trip' && (
          <div className="input-group">
            <i className="fas fa-calendar-alt icon"></i>
            <DatePicker
              selected={returnDate}
              onChange={(date) => setReturnDate(date)}
              placeholderText="Return Date"
              required
            />
          </div>
        )}
        <button type="submit" className="btn primary">
          <i className="fas fa-search"></i> Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
