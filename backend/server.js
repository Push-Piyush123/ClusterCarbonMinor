const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const msmeRoutes = require('./routes/msmeRoutes');
const msmeDataRoutes = require('./routes/msmeDataRoutes');
const aggregatorRoutes = require('./routes/aggregatorRoutes');
const verifierRoutes = require('./routes/verifierRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clusterRoutes = require('./routes/clusterRoutes');
const emissionRoutes = require('./routes/emissionRoutes');
const riskAllocationRoutes = require('./routes/riskAllocationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allow requests from a React frontend
app.use(express.json()); // Parse incoming JSON requests

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/msmes', msmeRoutes);
app.use('/api/msmes', authMiddleware, msmeDataRoutes);
app.use('/api/aggregators', aggregatorRoutes);
app.use('/api/verifiers', verifierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clusters', clusterRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/risk-allocation', authMiddleware, riskAllocationRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Simple test route
app.get('/', (req, res) => {
    res.send('ClusterCarbon Backend is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
