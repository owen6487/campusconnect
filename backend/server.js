const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
dotenv.config();

const app = express();
// Trust the first proxy (Render and other proxies)
app.set('trust proxy', 1);
const allowedOrigins = [
  'https://campusconnect.co.ke',
  'https://www.campusconnect.co.ke',
  
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
}));

// Connect to the database
connectDB();

const usersRouter = require('./routes/usersrouters');
const productRouter = require('./routes/productroutes');
const branchRouter = require('./routes/branchroute');
const campusRouter = require('./routes/campusroutes');
const shareRouter = require('./routes/shareroutes');
const feedbackRouter = require('./routes/feedbackroutes');
const contactRouter = require('./routes/contactroutes');
const adminRouter = require('./routes/adminroutes');

// Middleware to parse JSON requests
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Wake endpoint for overlay / open-link wakeups (Render free-tier keep-alive)
app.get('/campusconnect', (req, res) => {
  res.status(200).json({ status: 'awake', timestamp: new Date().toISOString() });
});

require("./routes/seoRoutes")(app);

// Use the users router for user-related routes
app.use('/api/users', usersRouter);
app.use('/api/products', productRouter);
app.use('/api/branches', branchRouter);
app.use('/api/campuses', campusRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);
app.use('/share', shareRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});