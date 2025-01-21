import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';
import categories from '../Categories/Categories'; 

const UserProfile = () => {
  const defaultProfilePic = 'https://preview.redd.it/h5gnz1ji36o61.png?width=225&format=png&auto=webp&s=84379f8d3bbe593a2e863c438cd03e84c8a474fa';
  const cameraIconUrl = 'https://static.thenounproject.com/png/625182-200.png';
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const [userCategories, setUserCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(currentUser?.profilePic || defaultProfilePic);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-categories', {
          params: { email: currentUser.email }
        });

        if (response.status === 200) {
          setUserCategories(response.data.categories);
          console.log('Fetched categories:', response.data.categories);
        } else {
          throw new Error('Failed to fetch user categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetch
      }
    };

    if (currentUser && loading) {
      fetchCategories();
    }
  }, [currentUser, loading]); // Ensure the effect only runs once

  const handlePreferencesClick = () => {
    navigate('/select-categories', { state: { email: currentUser.email, password: currentUser.password, isSigningUp: false } });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('email', currentUser.email); // Include the email in the form data

    try {
      const response = await axios.post('http://localhost:5000/upload-profile-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setProfilePic(response.data.imageUrl);
        // Update the user's profile picture in local storage
        const updatedUser = { ...currentUser, profilePic: response.data.imageUrl };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await axios.post('http://localhost:5000/update-profile', { fullName, email, currentEmail: currentUser.email });

      if (response.status === 200) {
        // Update local storage with new user info
        const updatedUser = { ...currentUser, fullName, email };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setIsEditing(false);
        alert('Profile updated successfully');
        window.location.reload(); // Reload the page to see the changes
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!currentUser) {
    return <div>Please sign in to view your profile.</div>;
  }

  const selectedCategories = categories.filter(category => userCategories.includes(category.name));

  return (
    <div className="user-profile">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-title">Profile</div>
          <div className="profile-details">
            <div className="profile-pic-container">
              <img src={profilePic} alt="User Profile" className="profile-pic" />
              <label className="camera-icon" htmlFor="file-input">
                <img src={cameraIconUrl} alt="Upload" />
              </label>
              <input id="file-input" type="file" accept="image/*" className="input-file" onChange={handleImageUpload} />
            </div>
            <div className="details">
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button className="update-profile-btn" onClick={handleProfileUpdate}>
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <p><strong>Name:</strong> {fullName}</p>
                  <p><strong>Email:</strong> {email}</p>
                  <button className="update-profile-btn" onClick={() => setIsEditing(true)}>
                    Update Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="categories-card">
          <h2>Your Categories</h2>
          <div className="categories">
            {selectedCategories.length > 0 ? (
              selectedCategories.map((category, index) => (
                <div key={index} className="category-card">
                  <img src={category.image} alt={category.name} className="category-image" />
                  <div className="category-info">
                    <h2>{category.name}</h2>
                    <p>{category.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No categories selected.</p>
            )}
          </div>
          <button className="change-preferences-btn" onClick={handlePreferencesClick}>Change Your Preferences</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
