const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { port, mongoUri, clientUrl } = require('./config/config');
// Ensure all referenced models are registered with Mongoose
require('./models/Treatment');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const bloodRoutes = require('./routes/bloodRoutes');
const bloodRequestRoutes = require('./routes/bloodRequestRoutes');
const donationRequestRoutes = require('./routes/donationRequestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const { authLimiter } = require('./middleware/rateLimit');

const app = express();

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Smart Blood Bank API running' });
});

// public API v0
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/requests', bloodRequestRoutes);
app.use('/api/donations', donationRequestRoutes);
app.use('/api/admin', adminRoutes);

// versioned API v1 (aliases to same routes)
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/blood', bloodRoutes);
app.use('/api/v1/requests', bloodRequestRoutes);
app.use('/api/v1/donations', donationRequestRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

