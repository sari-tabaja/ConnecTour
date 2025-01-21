import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './AttractionCategorySelection.css';
import categories from '../Categories/Categories';; 

const AttractionCategorySelection = () => {
  const location = useLocation();
  const { email, password, isSigningUp } = location.state || {}; // Get email, password, and isSigningUp from location state
  const navigate = useNavigate(); // Initialize the navigate function
  console.log("Is signing up??", isSigningUp);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleSelectCategory = (category) => {
    const newSelections = selectedCategories.includes(category.name)
      ? selectedCategories.filter((c) => c !== category.name)
      : [...selectedCategories, category.name];

    setSelectedCategories(newSelections);
  };

  const handleSaveCategories = async () => {
    try {
      console.log('Email:', email); // Debug: Check if email is correct
      console.log('Password:', password); // Debug: Check if password is correct
      console.log('Is Signing Up:', isSigningUp); // Debug: Check if isSigningUp is correct

      if (!email) {
        throw new Error('Email is missing');
      }

      // Save the selected categories
      const saveCategoriesResponse = await axios.post('http://localhost:5000/save-categories', {
        email,
        selectedCategories
      });

      if (saveCategoriesResponse.status !== 200) {
        throw new Error('Failed to save categories');
      }

      if (isSigningUp) {
        // After saving categories, sign in the user
        const signInResponse = await axios.post('http://localhost:5000/signin', { email, password });

        if (signInResponse.status !== 200) {
          throw new Error('Failed to sign in');
        }

        const { token, user } = signInResponse.data;
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Fetch user categories
        const categoriesResponse = await axios.get('http://localhost:5000/get-categories', {
          params: { email: user.email }
        });

        if (categoriesResponse.status !== 200) {
          throw new Error('Failed to fetch user categories');
        }

        const userCategories = categoriesResponse.data.categories;
        localStorage.setItem('userCategories', JSON.stringify(userCategories));

        alert('Categories saved and signed in successfully!');
        navigate('/'); // Redirect to home page after signing up
      } else {
        alert('Categories saved successfully!');
        navigate('/profile'); // Redirect to profile page after changing preferences
      }
    } catch (error) {
      alert(`Error saving categories: ${error.message}`);
    }
  };

  return (
    <div className="attraction-category-selection">
      <h1>Choose Your Attraction Categories</h1>
      <div className="categories">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-card ${selectedCategories.includes(category.name) ? 'selected' : ''}`}
            onClick={() => handleSelectCategory(category)}
          >
            <img src={category.image} alt={category.name} className="category-image" />
            <div className="category-info">
              <h2>{category.name}</h2>
              <p>{category.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="btn primary" onClick={handleSaveCategories}>Save Categories</button>
    </div>
  );
};

export default AttractionCategorySelection;
