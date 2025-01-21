import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './PersonalizedAttractions.css';

const flightIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/ios-filled/50/000000/airport.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const categoryMappings = {
  museums: ["museum", "Museums", "art_gallery", "art museums", "specialty museums"],
  parks: ["park", "natural_feature", "campground", "amusement_park", "Nature & Parks"],
  shopping: ["Shopping", "shopping_mall", "clothing_store", "book_store", "shoe_store", "electronics_store", "restaurant", "street markets", "airport shops"],
  historical: ["tourist_attraction", "church", "synagogue", "mosque", "churches & cathedrals", "sacred & religious sites"],
  entertainment: ["movie_theater", "night_club", "casino", "Tours", "bowling_alley", "restaurant", "observation decks & towers", "bus tours", "Sights & Landmarks", "sit_down"],
  nature: ["zoo", "aquarium", "Nature & Parks", "Zoos & Aquariums"],
};

const getStarRatingHTML = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="rating">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={i} className="star filled"><i className="fas fa-star"></i></span>
      ))}
      {halfStar && <span className="star half"><i className="fas fa-star-half-alt"></i></span>}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={i} className="star"><i className="far fa-star"></i></span>
      ))}
    </div>
  );
};

function UpdateMapView({ center }) {
  const map = useMap();
  map.setView(center, 12);
  return null;
}

function PersonalizedAttractions() {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = location.state?.email || JSON.parse(localStorage.getItem('currentUser'))?.email;
  const { stopoverLocations } = location.state || {};
  const [userCategories, setUserCategories] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      console.error('User email is missing');
      navigate('/signin'); // Redirect to sign in if email is missing
      return;
    }

    const storedCategories = JSON.parse(localStorage.getItem('userCategories'));
    if (storedCategories) {
      setUserCategories(storedCategories);
      console.log('User Categories from Local Storage:', storedCategories);
    } else {
      console.error('No user categories found in local storage.');
    }
  }, [userEmail, navigate]);

  const calculateRadius = (durationInMinutes) => {
    const hours = durationInMinutes / 60; // Convert minutes to hours
    return hours; // Radius in kilometers
  };

  const filterByCategories = (items, categories) => {
    console.log('Filtering items by categories:', categories);
    if (!categories || categories.length === 0) return items;

    const expandedCategories = categories.flatMap(userCategory => categoryMappings[userCategory.toLowerCase()] || []).map(subcategory => subcategory.toLowerCase());

    return items.filter(item => {
      if (!item.subcategory) {
        console.log(`Item ${item.name} has no subcategory.`);
        return false;
      }

      console.log('Item Subcategory Structure:', item.subcategory);

      const matched = expandedCategories.some(expandedCategory => {
        const isMatch = item.subcategory.some(subCatObj => subCatObj.name.toLowerCase().includes(expandedCategory));
        console.log(
          `Expanded Category: ${expandedCategory}, Place Subcategory: ${item.subcategory.map(subCatObj => subCatObj.name)}, Match: ${isMatch}`
        );
        return isMatch;
      });
      if (!matched) {
        console.log(`Unmatched Place Subcategory: ${item.subcategory.map(subCatObj => subCatObj.name)}`);
      }
      return matched;
    });
  };

  const fetchData = async (loc, radius) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/places/fetch-data`, {
        params: {
          lat: loc.lat,
          lng: loc.lng,
          radius,
        },
      });

      const { attractions: fetchedAttractions, restaurants: fetchedRestaurants } = response.data;

      console.log('Attractions fetched:', fetchedAttractions);
      console.log('Restaurants fetched:', fetchedRestaurants);

      const filteredAttractions = filterByCategories(fetchedAttractions, userCategories);
      const filteredRestaurants = fetchedRestaurants;

      console.log('Filtered Attractions:', filteredAttractions);
      console.log('Filtered Restaurants:', filteredRestaurants);

      setAttractions(prev => [
        ...prev,
        ...filteredAttractions.filter(attraction =>
          !prev.some(existingAttraction => existingAttraction.location_id === attraction.location_id)
        ),
      ]);

      setRestaurants(prev => [
        ...prev,
        ...filteredRestaurants.filter(restaurant =>
          !prev.some(existingRestaurant => existingRestaurant.location_id === restaurant.location_id)
        ),
      ]);

      console.log('Fetched Attractions and Restaurants for Location:', loc.name, filteredAttractions, filteredRestaurants);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (userCategories.length === 0 || !stopoverLocations || stopoverLocations.length === 0) return;

    const fetchAllData = async () => {
      for (const loc of stopoverLocations) {
        const arrivalDate = new Date(loc.arrival);
        const departureDate = new Date(loc.departure);
        const durationInMinutes = (departureDate - arrivalDate) / (1000 * 60);
        const radius = calculateRadius(durationInMinutes);

        await fetchData(loc, radius);
      }
      setHasFetched(true); // Set hasFetched to true only after all data has been fetched
    };

    if (stopoverLocations.length === 1) {
      setMapCenter([stopoverLocations[0].lat, stopoverLocations[0].lng]);
    } else {
      const latitudes = stopoverLocations.map((loc) => loc.lat);
      const longitudes = stopoverLocations.map((loc) => loc.lng);
      const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
      const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
      setMapCenter([avgLat, avgLng]);
    }

    fetchAllData();
  }, [userCategories, stopoverLocations]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };

  return (
    <div className="personalized-attractions-container">
      <div className="details-container">
        <div className="left-column">
          <button className="back-button" onClick={() => navigate(-1)}>Back</button> {/* Add Back Button */}
          <div className="stopover-details">
            {stopoverLocations &&
              stopoverLocations.map((location, index) => {
                const arrivalDate = new Date(location.arrival);
                const departureDate = new Date(location.departure);
                const durationInMinutes = (departureDate - arrivalDate) / (1000 * 60);
                const hours = Math.floor(durationInMinutes / 60);
                const minutes = durationInMinutes % 60;
                return (
                  <div key={index} className="stopover-card">
                    <h4>Stop Over Station</h4>
                    <h3>{location.name}</h3>
                    <p className="info-header">
                      Arrival: <span className="info-value-red">{arrivalDate.toLocaleString()}</span>
                    </p>
                    <p className="info-header">
                      Departure: <span className="info-value-red">{departureDate.toLocaleString()}</span>
                    </p>
                    <p className="info-header">
                      Duration: <span className="info-value-red">{`${hours} hours ${minutes} minutes`}</span>
                    </p>
                  </div>
                );
              })}
          </div>
          <div className="map-wrapper">
            <MapContainer center={mapCenter} className="leaflet-container">
              <UpdateMapView center={mapCenter} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {stopoverLocations &&
                stopoverLocations.map((location, index) => (
                  <Marker key={index} position={[location.lat, location.lng]} icon={flightIcon}>
                    <Popup>{location.name}</Popup>
                  </Marker>
                ))}
              {attractions.map((attraction, index) =>
                attraction.latitude && attraction.longitude ? (
                  <Marker
                    key={index}
                    position={[attraction.latitude, attraction.longitude]}
                    icon={new L.Icon({
                      iconUrl: 'https://img.icons8.com/color/48/000000/marker.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [0, -41],
                    })}
                  >
                    <Popup>
                      <div className="map-popup-card">
                        <h3>{attraction.name}</h3>
                        <img
                          src={
                            attraction.photo && attraction.photo.images && attraction.photo.images.original
                              ? attraction.photo.images.original.url
                              : 'https://via.placeholder.com/100'
                          }
                          alt={attraction.name}
                          style={{ width: '100px', height: 'auto', marginBottom: '10px' }}
                        />
                        <p>{attraction.address_obj ? `${attraction.address_obj.street1}, ${attraction.address_obj.city}, ${attraction.address_obj.country}` : ''}</p>
                        <div className="description-container">
                          <p>{attraction.description}</p>
                        </div>
                        {getStarRatingHTML(attraction.rating)}
                        <a href={attraction.web_url} target="_blank" rel="noopener noreferrer">
                          View on TripAdvisor
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
              {restaurants.map((restaurant, index) =>
                restaurant.latitude && restaurant.longitude ? (
                  <Marker
                    key={index}
                    position={[restaurant.latitude, restaurant.longitude]}
                    icon={new L.Icon({
                      iconUrl: 'https://img.icons8.com/color/48/000000/marker.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [0, -41],
                    })}
                  >
                    <Popup>
                      <div className="map-popup-card">
                        <h3>{restaurant.name}</h3>
                        <img
                          src={
                            restaurant.photo && restaurant.photo.images && restaurant.photo.images.original
                              ? restaurant.photo.images.original.url
                              : 'https://via.placeholder.com/100'
                          }
                          alt={restaurant.name}
                          style={{ width: '100px', height: 'auto', marginBottom: '10px' }}
                        />
                        <p>{restaurant.address_obj ? `${restaurant.address_obj.street1}, ${restaurant.address_obj.city}, ${restaurant.address_obj.country}` : ''}</p>
                        <div className="description-container">
                          <p>{restaurant.description}</p>
                        </div>
                        {getStarRatingHTML(restaurant.rating)}
                        <a href={restaurant.web_url} target="_blank" rel="noopener noreferrer">
                          View on TripAdvisor
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>
        </div>
        <div className="right-column">
          <div className="relevant-attractions">
            <h3>Something to Do</h3>
            <Slider {...sliderSettings}>
              {attractions.map((attraction, index) => (
                <div key={index} className="attraction-card">
                  <img
                    src={
                      attraction.photo && attraction.photo.images && attraction.photo.images.original
                        ? attraction.photo.images.original.url
                        : 'https://via.placeholder.com/100'
                    }
                    alt={attraction.name}
                  />
                  <h4>{attraction.name}</h4>
                  <div className="description-container">
                    <p>{attraction.address_obj ? `${attraction.address_obj.street1}, ${attraction.address_obj.city}, ${attraction.address_obj.country}` : ''}</p>
                    <p>{attraction.description}</p>
                  </div>
                  <div className="rating">
                    {Array.from({ length: Math.floor(attraction.rating) }).map((_, i) => (
                      <span key={i} className="star filled"><i className="fas fa-star"></i></span>
                    ))}
                    {attraction.rating % 1 !== 0 && <span className="star half"><i className="fas fa-star-half-alt"></i></span>}
                    {Array.from({ length: 5 - Math.ceil(attraction.rating) }).map((_, i) => (
                      <span key={i} className="star"><i className="far fa-star"></i></span>
                    ))}
                  </div>
                  <p>Number of reviews: {attraction.num_reviews}</p>
                  <p>
                    <a href={attraction.web_url} target="_blank" rel="noopener noreferrer">
                      View on TripAdvisor
                    </a>
                  </p>
                </div>
              ))}
            </Slider>
          </div>
          <div className="relevant-attractions">
            <h3>Something to Eat</h3>
            <Slider {...sliderSettings}>
              {restaurants.map((restaurant, index) => (
                <div key={index} className="attraction-card">
                  <img
                    src={
                      restaurant.photo && restaurant.photo.images && restaurant.photo.images.original
                        ? restaurant.photo.images.original.url
                        : 'https://via.placeholder.com/100'
                    }
                    alt={restaurant.name}
                  />
                  <h4>{restaurant.name}</h4>
                  <div className="description-container">
                    <p>{restaurant.address_obj ? `${restaurant.address_obj.street1}, ${restaurant.address_obj.city}, ${restaurant.address_obj.country}` : ''}</p>
                    <p>{restaurant.description}</p>
                  </div>
                  <div className="rating">
                    {Array.from({ length: Math.floor(restaurant.rating) }).map((_, i) => (
                      <span key={i} className="star filled"><i className="fas fa-star"></i></span>
                    ))}
                    {restaurant.rating % 1 !== 0 && <span className="star half"><i className="fas fa-star-half-alt"></i></span>}
                    {Array.from({ length: 5 - Math.ceil(restaurant.rating) }).map((_, i) => (
                      <span key={i} className="star"><i className="far fa-star"></i></span>
                    ))}
                  </div>
                  <p>Number of reviews: {restaurant.num_reviews}</p>
                  <p>
                    <a href={restaurant.web_url} target="_blank" rel="noopener noreferrer">
                      View on TripAdvisor
                    </a>
                  </p>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalizedAttractions;
