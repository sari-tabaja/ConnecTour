const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/user');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Save files with a timestamp
  }
});

const upload = multer({ storage: storage });

// Sign up route
router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log('Sign-up request received:', { fullName, email, password });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User with this email already exists.');
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hashedPassword });

    await user.save();
    console.log('User registered successfully.');

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.log('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user.' });
  }
});

// Sign in route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  console.log('Sign-in request received:', { email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Invalid email or password.');
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid email or password.');
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Include the _id in the user object
    res.json({ token, user: { _id: user._id, fullName: user.fullName, email: user.email, profilePic: user.profilePic } });
  } catch (error) {
    console.log('Error signing in user:', error);
    res.status(500).json({ message: 'Error signing in user.' });
  }
});

// Save categories route
router.post('/save-categories', async (req, res) => {
  const { email, selectedCategories } = req.body;
  console.log('Save categories request received:', { email, selectedCategories });

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { categories: selectedCategories },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Categories saved successfully', user });
  } catch (error) {
    console.log('Error saving categories:', error);
    res.status(500).json({ message: 'Error saving categories', error });
  }
});

// Get user categories route
router.get('/get-categories', async (req, res) => {
  const { email } = req.query;
  console.log('Get categories request received for email:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found.');
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ categories: user.categories });
  } catch (error) {
    console.log('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

// Upload profile picture route
router.post('/upload-profile-pic', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // Update the user's profile picture in the database
    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      { profilePic: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image');
  }
});

// Update profile route
router.post('/update-profile', async (req, res) => {
  console.log('Update profile request received:', req.body);
  const { fullName, email, currentEmail } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { email: currentEmail },
      { fullName, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile');
  }
});

// Serve static files from the 'uploads' directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
