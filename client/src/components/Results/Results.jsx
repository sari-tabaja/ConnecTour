import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Results.css';

function getAirlineLogo(flightNumber) {
    const airline = flightNumber.split('_')[0];
    const logos = {
        "KLM": "https://1000logos.net/wp-content/uploads/2021/03/KLM-logo.jpg",
        "BritishAirways": "https://logo-marque.com/wp-content/uploads/2021/02/British-Airways-Logo.png",
        "Lufthansa": "https://logos-world.net/wp-content/uploads/2020/10/Lufthansa-Logo.png",
        "AirFrance": "https://logos-world.net/wp-content/uploads/2020/03/Air-France-Logo-2009-2016.jpg",
        "Swiss": "https://th.bing.com/th/id/OIP.mHOqwQTypXrlup8-mmQ2FwHaFj?rs=1&pid=ImgDetMain"
    };
    const url = logos[airline] || "https://via.placeholder.com/50";
    console.log(`Airline: ${airline}, Generated URL:`, url);
    return url;
}

function formatFlightNumber(flightNumber) {
    return flightNumber.replace('_', ' ');
}

function Results() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const location = useLocation();
    const { from, to, tripType, departureDate, returnDate } = location.state;
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/flights');
                const filteredResults = response.data.filter(flight => {
                    const fromMatch = flight.from.town.toLowerCase().includes(from.split(' ')[0].toLowerCase());
                    const toMatch = flight.to.town.toLowerCase().includes(to.split(' ')[0].toLowerCase());
                    const departureMatch = new Date(flight.departure).toDateString() === new Date(departureDate).toDateString();
                    const returnMatch = tripType === 'round-trip' ? new Date(flight.returnDeparture).toDateString() === new Date(returnDate).toDateString() : true;
                    return fromMatch && toMatch && departureMatch && returnMatch && flight.tripType === tripType;
                });
                setResults(filteredResults);
                console.log("Filtered Results:", filteredResults);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [from, to, tripType, departureDate, returnDate]);

    const handleSelect = (id) => {
        setSelectedFlight(selectedFlight === id ? null : id);
    };

    const handleViewDetails = (id) => {
        navigate(`/details/${id}`);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex < results.length - 2 ? prevIndex + 1 : prevIndex));
    };

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${currentIndex * 160}px)`;
        }
    }, [currentIndex]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading data: {error.message}</p>;
    if (results.length === 0) return <p>No flights found matching the criteria.</p>;

    return (
        <div className="results-container">
            <div className="cards-slider">
                <button className="slider-button prev" onClick={handlePrev}>‹</button>
                <div className="cards-container" ref={containerRef}>
                    {results.map(result => (
                        <div className="card" key={result._id}>
                            {selectedFlight !== result._id ? (
                                <>
                                    <div className="card-header">
                                        <div className="flight-type">
                                            {tripType === 'one-way' || result.returnDeparture ? 'Departure Flight' : 'Return Flight'}
                                        </div>
                                        <div className="airline-logo">
                                            <img src={getAirlineLogo(result.flightNumber)} alt={`${result.flightNumber} logo`} onError={(e) => e.target.src = "https://via.placeholder.com/50"} />
                                        </div>
                                        <div className="flight-number">{formatFlightNumber(result.flightNumber)}</div>
                                        <div className="price">${result.price}</div>
                                    </div>
                                    <div className="card-body">
                                        <div className="flight-info">
                                            <div className="segment-info">
                                                <div className="label">From:</div>
                                                <div className="airport">{result.from.town}, {result.from.country}</div>
                                                <div className="time">{new Date(result.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                            <div className="stop-count">{result.stopovers.length > 0 ? `${result.stopovers.length} stop(s):` : 'Non-stop'}</div>
                                            {result.stopovers.length > 0 && (
                                                <div className="stopovers">
                                                    {result.stopovers.map((stopover, index) => (
                                                        <div key={index} className="stopover-info">
                                                            <div>{stopover.stopoverTown}, {stopover.stopoverCountry}</div>
                                                            <div>Arrival: {new Date(stopover.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                            <div>Departure: {new Date(stopover.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="segment-info">
                                                <div className="label">To:</div>
                                                <div className="airport">{result.to.town}, {result.to.country}</div>
                                                <div className="time">{new Date(result.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                            <div className="flight-duration">Duration: {Math.ceil((new Date(result.arrival) - new Date(result.departure)) / (1000 * 60 * 60))}h</div>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        {tripType === 'one-way' ? (
                                            <button className="view-deal" onClick={() => handleViewDetails(result._id)}>View Deal</button>
                                        ) : (
                                            <button className="select-button" onClick={() => handleSelect(result._id)}>Show Return</button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                tripType === 'round-trip' && (
                                    <div className="return-card expanded">
                                        <div className="card-header">
                                            <div className="flight-type">Return Flight</div>
                                            <div className="airline-logo">
                                                <img src={getAirlineLogo(result.flightNumber)} alt={`${result.flightNumber} logo`} onError={(e) => e.target.src = "https://via.placeholder.com/50"} />
                                            </div>
                                            <div className="flight-number">{formatFlightNumber(result.flightNumber)}</div>
                                            <div className="price">${result.price}</div>
                                        </div>
                                        <div className="card-body">
                                            <div className="flight-info">
                                                <div className="flight-segment">
                                                    <div className="segment-info">
                                                        <div className="label">Return From:</div>
                                                        <div className="airport">{result.to.town}, {result.to.country}</div>
                                                        <div className="time">{new Date(result.returnDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                    <div className="segment-info">
                                                        <div className="label">Return To:</div>
                                                        <div className="airport">{result.from.town}, {result.from.country}</div>
                                                        <div className="time">{new Date(result.returnArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                </div>
                                                <div className="flight-duration">Duration: {Math.ceil((new Date(result.returnArrival) - new Date(result.returnDeparture)) / (1000 * 60 * 60))}h</div>
                                                {result.returnStopovers && result.returnStopovers.length > 0 && (
                                                    <div className="stopovers">
                                                        {result.returnStopovers.map((stopover, index) => (
                                                            <div key={index} className="stopover-info">
                                                                <div>{stopover.stopoverTown}, {stopover.stopoverCountry}</div>
                                                                <div>Arrival: {new Date(stopover.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                                <div>Departure: {new Date(stopover.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="stop-count">{result.returnStopovers && result.returnStopovers.length > 0 ? `${result.returnStopovers.length} stop(s):` : 'Non-stop'}</div>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <button className="view-deal" onClick={() => handleViewDetails(result._id)}>View Deal</button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>
                <button className="slider-button next" onClick={handleNext}>›</button>
            </div>
        </div>
    );
}

export default Results;