import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FlightDetails.css';

const smallAirplaneMarker = 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png';

function FlightDetails() {
    const { id } = useParams();
    const [flight, setFlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [departureMapUrl, setDepartureMapUrl] = useState('');
    const [returnMapUrl, setReturnMapUrl] = useState('');
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    useEffect(() => {
        const fetchFlight = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/flights/${id}`);
                setFlight(response.data);

                const departurePathPoints = [`${response.data.from.town},${response.data.from.country}`, `${response.data.to.town},${response.data.to.country}`];
                const departureMarkers = [
                    `icon:${smallAirplaneMarker}|${response.data.from.town},${response.data.from.country}`,
                    `icon:${smallAirplaneMarker}|${response.data.to.town},${response.data.to.country}`
                ];

                response.data.stopovers.forEach((stopover) => {
                    departureMarkers.push(`icon:${smallAirplaneMarker}|${stopover.stopoverTown},${stopover.stopoverCountry}`);
                    departurePathPoints.splice(1, 0, `${stopover.stopoverTown},${stopover.stopoverCountry}`);
                });

                const departureMapResponse = await axios.get('http://localhost:5000/api/flight-travel-road/map', {
                    params: { pathPoints: departurePathPoints, markers: departureMarkers }
                });
                setDepartureMapUrl(departureMapResponse.data.mapUrl);

                if (response.data.tripType === 'round-trip') {
                    const returnPathPoints = [`${response.data.to.town},${response.data.to.country}`, `${response.data.from.town},${response.data.from.country}`];
                    const returnMarkers = [
                        `icon:${smallAirplaneMarker}|${response.data.to.town},${response.data.to.country}`,
                        `icon:${smallAirplaneMarker}|${response.data.from.town},${response.data.from.country}`
                    ];

                    response.data.returnStopovers?.forEach((stopover) => {
                        returnMarkers.push(`icon:${smallAirplaneMarker}|${stopover.stopoverTown},${stopover.stopoverCountry}`);
                        returnPathPoints.splice(1, 0, `${stopover.stopoverTown},${stopover.stopoverCountry}`);
                    });

                    const returnMapResponse = await axios.get('http://localhost:5000/api/flight-travel-road/map', {
                        params: { pathPoints: returnPathPoints, markers: returnMarkers }
                    });
                    setReturnMapUrl(returnMapResponse.data.mapUrl);
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchFlight();
    }, [id]);

    const handleBooking = () => {
        if (!currentUser) {
            alert('Please log in to make a booking.');
            navigate('/signin');
            return;
        }

        navigate('/payment', { state: { flight, currentUser } });
    };

    const handlePersonalizedAttractions = async () => {
        if (!currentUser) {
            alert('Please log in to view personalized attractions.');
            navigate('/signin');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:5000/api/places/stopover-locations', {
                stopovers: flight.stopovers
            });
    
            const validLocations = response.data;
    
            navigate('/personalized-attractions', { state: { stopoverLocations: validLocations } });
        } catch (error) {
            console.error('Error fetching stopover locations:', error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading flight details: {error.message}</p>;

    const getAirlineLogo = (flightNumber) => {
        const airline = flightNumber.split('_')[0];
        const logos = {
            "KLM": "https://1000logos.net/wp-content/uploads/2021/03/KLM-logo.jpg",
            "BritishAirways": "https://logo-marque.com/wp-content/uploads/2021/02/British-Airways-Logo.png",
            "Lufthansa": "https://logos-world.net/wp-content/uploads/2020/10/Lufthansa-Logo.png",
            "AirFrance": "https://logos-world.net/wp-content/uploads/2020/03/Air-France-Logo-2009-2016.jpg",
            "Swiss": "https://th.bing.com/th/id/OIP.mHOqwQTypXrlup8-mmQ2FwHaFj?rs=1&pid=ImgDetMain"
        };
        return logos[airline] || "https://via.placeholder.com/50";
    };

    const formatFlightNumber = (flightNumber) => {
        return flightNumber.replace('_', ' ');
    };

    return (
        <div className="flight-details-container">
            <h2 className="flight-details-title">Flight Details</h2>
            <div className="flight-section">
                <div className="flight-card">
                    <h3 className="flight-type-title">Departure Flight</h3>
                    <div className="card-header">
                        <div className="airline-logo">
                            <img src={getAirlineLogo(flight.flightNumber)} alt={`${flight.flightNumber} logo`} />
                        </div>
                        <div className="flight-number">{formatFlightNumber(flight.flightNumber)}</div>
                    </div>
                    <div className="info-item">
                        <span>From:</span> {flight.from.town}, {flight.from.country}
                    </div>
                    <div className="info-item">
                        <span>To:</span> {flight.to.town}, {flight.to.country}
                    </div>
                    <div className="info-item">
                        <span>Departure:</span> {new Date(flight.departure).toLocaleString()}
                    </div>
                    <div className="info-item">
                        <span>Arrival:</span> {new Date(flight.arrival).toLocaleString()}
                    </div>
                    <div className="stopovers">
                        {flight.stopovers.length > 0 ? (
                            <>
                                <div className="stop-title">{flight.stopovers.length} stop(s)</div>
                                {flight.stopovers.map((stopover, index) => (
                                    <div key={index} className="stopover">
                                        <div className="stopover-info">
                                            <div>{stopover.stopoverTown}, {stopover.stopoverCountry}</div>
                                            <div>Arrival: {new Date(stopover.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            <div>Departure: {new Date(stopover.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="stop-title">Non-stop</div>
                        )}
                    </div>
                    {departureMapUrl && <img src={departureMapUrl} alt="Departure Flight Route Map" className="map-image" />}
                </div>
                {flight.tripType === 'round-trip' && (
                    <div className="flight-card">
                        <h3 className="flight-type-title">Return Flight</h3>
                        <div className="card-header">
                            <div className="airline-logo">
                                <img src={getAirlineLogo(flight.flightNumber)} alt={`${flight.flightNumber} logo`} />
                            </div>
                            <div className="flight-number">{formatFlightNumber(flight.flightNumber)}</div>
                        </div>
                        <div className="info-item">
                            <span>From:</span> {flight.to.town}, {flight.to.country}
                        </div>
                        <div className="info-item">
                            <span>To:</span> {flight.from.town}, {flight.from.country}
                        </div>
                        <div className="info-item">
                            <span>Departure:</span> {new Date(flight.returnDeparture).toLocaleString()}
                        </div>
                        <div className="info-item">
                            <span>Arrival:</span> {new Date(flight.returnArrival).toLocaleString()}
                        </div>
                        <div className="stopovers">
                            {flight.returnStopovers?.length > 0 ? (
                                <>
                                    <div className="stop-title">{flight.returnStopovers.length} stop(s)</div>
                                    {flight.returnStopovers.map((stopover, index) => (
                                        <div key={index} className="stopover">
                                            <div className="stopover-info">
                                                <div>{stopover.stopoverTown}, {stopover.stopoverCountry}</div>
                                                <div>Arrival: {new Date(stopover.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div>Departure: {new Date(stopover.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="stop-title">Non-stop</div>
                            )}
                        </div>
                        {returnMapUrl && <img src={returnMapUrl} alt="Return Flight Route Map" className="map-image" />}
                    </div>
                )}
            </div>
            <div className="flight-details-actions">
                <p className="flight-price">Price: ${flight.price}</p>
                <button onClick={handleBooking} className="btn primary">Book Now</button>
                <button onClick={handlePersonalizedAttractions} className="btn secondary">Search for nearby attraction</button>
            </div>
        </div>
    );
}

export default FlightDetails;
