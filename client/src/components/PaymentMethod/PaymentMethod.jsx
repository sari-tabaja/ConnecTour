import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PaymentMethod.css';

function PaymentMethod() {
    const navigate = useNavigate();
    const location = useLocation();
    const { flight, currentUser } = location.state || {};
    const [numPassengers, setNumPassengers] = useState(1);
    const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cost: flight ? flight.price : 0,
    });
    const [passengerDetails, setPassengerDetails] = useState([
        { fullName: '', passportNumber: '' },
    ]);
    const [isNumPassengersDisabled, setIsNumPassengersDisabled] = useState(false);

    useEffect(() => {
        const totalCost = flight.price * numPassengers;
        setPaymentDetails({ ...paymentDetails, cost: totalCost });
    }, [numPassengers, flight.price]);

    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails({ ...paymentDetails, [name]: value });
    };

    const handlePassengerInputChange = (index, e) => {
        const { name, value } = e.target;
        const newPassengerDetails = [...passengerDetails];
        newPassengerDetails[index][name] = value;
        setPassengerDetails(newPassengerDetails);
    };

    const handleNumPassengersChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setNumPassengers(value);
        if (value > passengerDetails.length) {
            setPassengerDetails([
                ...passengerDetails,
                ...Array(value - passengerDetails.length).fill({
                    fullName: '',
                    passportNumber: '',
                }),
            ]);
        } else {
            setPassengerDetails(passengerDetails.slice(0, value));
        }
    };

    const handlePassengerSubmit = (e) => {
        e.preventDefault();
        setIsNumPassengersDisabled(true); // Disable the number of passengers input after the first submit
        if (currentPassengerIndex < numPassengers - 1) {
            setCurrentPassengerIndex(currentPassengerIndex + 1);
        } else {
            setCurrentPassengerIndex(null); // To indicate all passengers have been submitted
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            if (!currentUser) {
                alert('Please log in to make a booking.');
                navigate('/signin');
                return;
            }

            const response = await axios.post('http://localhost:5000/api/bookings', {
                flightId: flight._id,
                userId: currentUser._id,
                paymentDetails,
                passengerDetails,
            });

            alert('Booking and payment successful!');
            navigate('/');
        } catch (error) {
            alert('Payment failed. Please try again.');
            console.error('Payment error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="payment-method-container">
            <div className="card passenger-card">
                <h2>Passenger Information</h2>
                <div className="form-group">
                    <label htmlFor="numPassengers">Number of Passengers</label>
                    <input
                        type="number"
                        id="numPassengers"
                        name="numPassengers"
                        value={numPassengers}
                        onChange={handleNumPassengersChange}
                        min="1"
                        required
                        disabled={isNumPassengersDisabled} // Disable the input field based on the state
                    />
                </div>
                {currentPassengerIndex !== null ? (
                    <form className="passenger-form" onSubmit={handlePassengerSubmit}>
                        <h3>Passenger {currentPassengerIndex + 1}</h3>
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={passengerDetails[currentPassengerIndex].fullName}
                                onChange={(e) => handlePassengerInputChange(currentPassengerIndex, e)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="passportNumber">Passport Number</label>
                            <input
                                type="text"
                                id="passportNumber"
                                name="passportNumber"
                                value={passengerDetails[currentPassengerIndex].passportNumber}
                                onChange={(e) => handlePassengerInputChange(currentPassengerIndex, e)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn primary">Submit</button>
                    </form>
                ) : (
                    <ul>
                        {passengerDetails.map((passenger, index) => (
                            <li key={index}>{passenger.fullName}</li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="card payment-card">
                <h2>Payment Details</h2>
                <form className="payment-form" onSubmit={handlePayment}>
                    <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={paymentDetails.cardNumber}
                            onChange={handlePaymentInputChange}
                            placeholder="1234 5678 9012 3456"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentDetails.expiryDate}
                            onChange={handlePaymentInputChange}
                            placeholder="MM/YY"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentDetails.cvv}
                            onChange={handlePaymentInputChange}
                            placeholder="123"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cost">Cost</label>
                        <input
                            type="number"
                            id="cost"
                            name="cost"
                            value={paymentDetails.cost}
                            onChange={handlePaymentInputChange}
                            readOnly
                        />
                    </div>
                    {currentPassengerIndex === null && (
                        <button type="submit" className="btn primary">Pay Now</button>
                    )}
                </form>
            </div>
        </div>
    );
}

export default PaymentMethod;
