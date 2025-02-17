const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const artRoutes = require('./routes/artRoutes');
const eventRoutes = require('./routes/eventRoutes');


// Mongo DB username and password
// saeidkhalili2024
// DZfjS3F8YrLKbJ8p

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/arts', artRoutes);
app.use('/api/events', eventRoutes);

// MongoDB connection string
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define routes
app.get('/', (req, res) => {
  res.send('Hello, ArtConnect!');
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const mongoose = require('mongoose');

const artSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  images: [{ type: String, required: true }],
  price: { type: Number, required: true },
  description: { type: String, required: true },
  artistID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Art', artSchema);

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  images: [{ type: String, required: true }],
  price: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  artistID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Event', eventSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Art' }],
  followed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, enum: ['Artist', 'Customer'], required: true },
  image: { type: String, default: '' },
  purchasedArts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Art' }],
  bookedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

module.exports = mongoose.model('User', userSchema);

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();
const Art = require('../models/Art');

// Set up multer for file uploads
const upload = multer({
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }
    cb(undefined, true);
  },
});

// Add a new art piece
router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    const { title, category, price, description, artistID } = req.body;
    const imageBase64Strings = await Promise.all(
      req.files.map(async (file) => {
        let buffer = await sharp(file.buffer)
          .resize(1200, 800)
          .toFormat('webp')
          .toBuffer();

        // Reduce quality until the image is under 150 KB
        let quality = 90;
        while (buffer.length > 150 * 1024 && quality > 10) {
          buffer = await sharp(file.buffer)
            .resize(1200, 800)
            .toFormat('webp', { quality })
            .toBuffer();
          quality -= 10;
        }

        // Convert buffer to base64
        return buffer.toString('base64');
      })
    );

    const newArt = new Art({
      title,
      category,
      images: imageBase64Strings, // Store the base64 strings
      price,
      description,
      artistID,
    });

    await newArt.save();
    res.status(201).json({ message: 'Art added successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { query, category } = req.query;
    const filter = { isAvailable: true };

    if (query) {
      filter.$or = [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') }
      ];
    }

    if (category) {
      filter.category = category;
    }

    const arts = await Art.find(filter).sort({ _id: -1 }).limit(10); // Sort by most recent
    res.json(arts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get art details by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching art with ID: ${req.params.id}`);
    const art = await Art.findById(req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Art not found' });
    }
    res.json(art);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update art availability
router.patch('/:id', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const art = await Art.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true });
    if (!art) {
      return res.status(404).json({ error: 'Art not found' });
    }
    res.json(art);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();
const Event = require('../models/Event');

// Set up multer for file uploads
const upload = multer({
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }
    cb(undefined, true);
  },
});

// Add a new event
router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    const { title, category, price, description, date, time, artistID } = req.body;
    const imageBase64Strings = await Promise.all(
      req.files.map(async (file) => {
        let buffer = await sharp(file.buffer)
          .resize(1200, 800)
          .toFormat('webp')
          .toBuffer();

        // Reduce quality until the image is under 150 KB
        let quality = 90;
        while (buffer.length > 150 * 1024 && quality > 10) {
          buffer = await sharp(file.buffer)
            .resize(1200, 800)
            .toFormat('webp', { quality })
            .toBuffer();
          quality -= 10;
        }

        // Convert buffer to base64
        return buffer.toString('base64');
      })
    );

    const newEvent = new Event({
      title,
      category,
      images: imageBase64Strings, // Store the base64 strings
      price,
      description,
      date,
      time,
      artistID,
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event added successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { query, category } = req.query;
    const filter = { isAvailable: true };

    if (query) {
      filter.$or = [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') }
      ];
    }

    if (category) {
      filter.category = category;
    }

    const events = await Event.find(filter).sort({ _id: -1 }).limit(10); // Sort by most recent
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event details by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching event with ID: ${req.params.id}`);
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event availability
router.patch('/:id', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();
const User = require('../models/User');
const Art = require('../models/Art');
const Event = require('../models/Event');

// Set up multer for file uploads
const upload = multer({
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }
    cb(undefined, true);
  },
});

// Update user image
router.post('/update-image/:id', upload.single('image'), async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize(250, 250) // Smaller size for profile pictures
      .toFormat('webp')
      .toBuffer();

    // Reduce quality until the image is under 50 KB
    let quality = 90;
    while (buffer.length > 50 * 1024 && quality > 10) {
      buffer = await sharp(req.file.buffer)
        .resize(250, 250)
        .toFormat('webp', { quality })
        .toBuffer();
      quality -= 10;
    }

    // Convert buffer to base64
    const base64Image = buffer.toString('base64');
    const user = await User.findByIdAndUpdate(req.params.id, { image: base64Image }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Image updated successfully', image: base64Image });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Implement token generation or session management here
    res.status(200).json({ message: 'Login successful', userId: user._id, userType: user.type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { fullname, email, password, type } = req.body;
    const newUser = new User({ fullname, email, password, type });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  // Implement token/session invalidation logic here
  console.log('User logged out successfully');
  res.status(200).json({ message: 'Logout successful' });
});

// Get user details
router.get('/details/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullname email type image favorites followed');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorite art
router.post('/toggle-favorite/:userId/:artId', async (req, res) => {
  try {
    const { userId, artId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFavorite = user.favorites.includes(artId);
    if (isFavorite) {
      user.favorites.pull(artId);
    } else {
      user.favorites.push(artId);
    }

    await user.save();
    res.status(200).json({ message: 'Favorites updated successfully', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch user's favorite arts and events
router.get('/favorites/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const favoriteArts = await Art.find({ _id: { $in: user.favorites } });

    const favoriteEvents = await Event.find({ _id: { $in: user.favorites } });

    res.json({ arts: favoriteArts, events: favoriteEvents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new route to toggle follow
router.post('/toggle-follow/:userId/:artistId', async (req, res) => {
  try {
    const { userId, artistId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = user.followed.includes(artistId);
    if (isFollowing) {
      user.followed.pull(artistId);
    } else {
      user.followed.push(artistId);
    }

    await user.save();
    res.status(200).json({ message: 'Follow status updated successfully', followed: user.followed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/complete-order', async (req, res) => {
  const { userId, itemId, itemType } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (itemType.toLowerCase() === 'art') {
      const art = await Art.findById(itemId);
      if (!art) {
        return res.status(404).json({ error: 'Art not found' });
      }
      user.purchasedArts.push(art._id);
    } else if (itemType.toLowerCase() === 'event') {
      const event = await Event.findById(itemId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      user.bookedEvents.push(event._id);
    }

    await user.save();
    res.status(200).json({ message: 'Order completed and user data updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;