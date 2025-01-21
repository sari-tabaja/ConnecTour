// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import SearchBar from './components/SearchBar/SearchBar';
import SignIn from './components/SignIn/SignIn';
import SignUp from './components/SignUp/SignUp';
import Results from './components/Results/Results';
import FlightDetails from './components/FlightDetails/FlightDetails';
import UserBookings from './components/UserBookings/UserBookings';
import PersonalizedAttractions from './components/PersonalizedAttractions/PersonalizedAttractions';
import AttractionCategorySelection from './components/AttractionCategorySelection/AttractionCategorySelection';
import PaymentMethod from './components/PaymentMethod/PaymentMethod';
import UserProfile from './components/UserProfile/UserProfile'; 

import Space from './Space';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<><Header /><Home /><SearchBar /></>} />
          <Route path="/signin" element={<><Header /><SignIn /></>} />
          <Route path="/signup" element={<><Header /><SignUp /></>} />
          <Route path="/results" element={<><Header /><Space /><SearchBar /><Results /></>} />
          <Route path="/details/:id" element={<><Header /><FlightDetails /></>} />
          <Route path="/bookings" element={<><Header /><UserBookings /></>} />
          <Route path="/personalized-attractions" element={<><Header /><PersonalizedAttractions /></>} />
          <Route path="/select-categories" element={<><Header /><AttractionCategorySelection /></>} />
          <Route path="/payment" element={<><Header /><PaymentMethod /></>} />
          <Route path="/profile" element={<><Header /><UserProfile /></>} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
