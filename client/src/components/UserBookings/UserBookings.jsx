import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserBookings.css';

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
    return url;
}

function formatFlightNumber(flightNumber) {
    return flightNumber.replace('_', ' ');
}

const UserBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                if (!currentUser) {
                    throw new Error('User not logged in');
                }

                const userId = currentUser._id;

                const response = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`);
                setBookings(response.data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [currentUser]);

    const [activeBooking, setActiveBooking] = useState(null);

    const toggleBookingDetails = (bookingId) => {
        setActiveBooking(activeBooking === bookingId ? null : bookingId);
    };

    const handlePersonalizedAttractions = async (booking) => {
        if (!currentUser) {
            alert('Please log in to view personalized attractions.');
            navigate('/signin');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:5000/api/places/stopover-locations', {
                stopovers: booking.flightId.stopovers
            });
    
            const validLocations = response.data;
    
            navigate('/personalized-attractions', { state: { stopoverLocations: validLocations } });
        } catch (error) {
            console.error('Error fetching stopover locations:', error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error fetching bookings: {error.message}</p>;

    return (
        <div className="user-bookings-container">
            <h2>My Bookings</h2>
            <div className="booking-items-container">
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <div key={booking._id} className="booking-item">
                            <div className="booking-summary" onClick={() => toggleBookingDetails(booking._id)}>
                                <div className="card-header">
                                    <div className="airline-logo">
                                        <img src={getAirlineLogo(booking.flightId.flightNumber)} alt="Airline Logo" />
                                    </div>
                                    <div className="flight-number">{formatFlightNumber(booking.flightId.flightNumber)}</div>
                                    <div className="price">${booking.flightId.price}</div>
                                </div>
                                <div className="flight-info">
                                    <div className="segment-info">
                                        <div className="label">From:</div>
                                        <div className="airport">{booking.flightId.from.town}, {booking.flightId.from.country}</div>
                                        <div className="time">{new Date(booking.flightId.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div className="stop-count">{booking.flightId.stopovers && booking.flightId.stopovers.length > 0 ? `${booking.flightId.stopovers.length} stop(s):` : 'Non-stop'}</div>
                                    {booking.flightId.stopovers && booking.flightId.stopovers.length > 0 && (
                                        <div className="stopovers">
                                            {booking.flightId.stopovers.map((stopover, index) => (
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
                                        <div className="airport">{booking.flightId.to.town}, {booking.flightId.to.country}</div>
                                        <div className="time">{new Date(booking.flightId.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div className="flight-duration">Duration: {Math.ceil((new Date(booking.flightId.arrival) - new Date(booking.flightId.departure)) / (1000 * 60 * 60))}h</div>
                                </div>
                                <button onClick={() => handlePersonalizedAttractions(booking)} className="btn secondary">Search for nearby attractions</button>
                            </div>
                            {activeBooking === booking._id && (
                                <div className="booking-details">
                                    <div><strong>Departure:</strong> {new Date(booking.flightId.departure).toLocaleString()}</div>
                                    <div><strong>Arrival:</strong> {new Date(booking.flightId.arrival).toLocaleString()}</div>
                                    {booking.flightId.returnDeparture && (
                                        <>
                                            <div className="return-flight-title"><strong>Return Flight</strong></div>
                                            <div><strong>Return Departure:</strong> {new Date(booking.flightId.returnDeparture).toLocaleString()}</div>
                                            <div><strong>Return Arrival:</strong> {new Date(booking.flightId.returnArrival).toLocaleString()}</div>
                                            {booking.flightId.returnStopovers && booking.flightId.returnStopovers.length > 0 && (
                                                <div className="return-stopovers">
                                                    {booking.flightId.returnStopovers.map((stopover, index) => (
                                                        <div key={index} className="stopover-info">
                                                            <div>{stopover.stopoverTown}, {stopover.stopoverCountry}</div>
                                                            <div>Arrival: {new Date(stopover.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                            <div>Departure: {new Date(stopover.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="stop-count">{booking.flightId.returnStopovers && booking.flightId.returnStopovers.length > 0 ? `${booking.flightId.returnStopovers.length} stop(s):` : 'Non-stop'}</div>
                                        </>
                                    )}
                                    <div className="vacation-duration">
                                        <strong>Vacation Duration:</strong> {Math.ceil((new Date(booking.flightId.returnArrival) - new Date(booking.flightId.departure)) / (1000 * 60 * 60 * 24))} days
                                    </div>
                                    <div><strong>Passengers:</strong></div>
                                    <ul>
                                        {booking.passengerDetails.map((passenger, index) => (
                                            <li key={index}>{passenger.fullName} - {passenger.passportNumber}</li>
                                        ))}
                                    </ul>
                                    <div><strong>Payment Details:</strong></div>
                                    <div>Card Number: **** **** **** {booking.paymentDetails.cardNumber.slice(-4)}</div>
                                    <div>Expiry Date: {booking.paymentDetails.expiryDate}</div>
                                    <div>CVV: ***</div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No bookings found.</p>
                )}
            </div>
        </div>
    );
};

export default UserBookings;