// Sample Code - all in one file - Not runing the app with these - use the Zip file ArtConnectBackend to start backend.


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
  artistID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
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
  artistID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Event', eventSchema);




const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Art' }],
  type: { type: String, enum: ['Artist', 'Customer'], required: true },
  image: { type: String, default: '' }
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

// Get all art pieces with images in base64
router.get('/', async (req, res) => {
    try {
      const arts = await Art.find();
      const artsWithBase64Images = arts.map(art => ({
        ...art.toObject(),
        images: art.images.map(imageBuffer => imageBuffer.toString('base64'))
      }));
      res.json(artsWithBase64Images);
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
  
  // Get all events with images in base64
  router.get('/', async (req, res) => {
    try {
      const events = await Event.find();
      const eventsWithBase64Images = events.map(event => ({
        ...event.toObject(),
        images: event.images.map(imageBuffer => imageBuffer.toString('base64'))
      }));
      res.json(eventsWithBase64Images);
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
    res.status(200).json({ message: 'Login successful', userId: user._id });
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

// Add this route to your userRoutes
router.get('/details/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullname email type image'); // Include image
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;