const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
require('./config/passport'); // 👈 Load Google Strategy here

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // your frontend
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
}));

// Express session (needed for OAuth)
app.use(session({
  secret: 'your_secret_key', // 🔐 keep it in .env for production
  resave: false,
  saveUninitialized: false,
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://khwajasadiya:jc83AzpIiDIsRX8k@cluster0.klk7mcf.mongodb.net/joblinker?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/routes/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
