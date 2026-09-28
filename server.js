require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

// Import routes
const caseRoutes = require('./routes/cases');
const hearingRoutes = require('./routes/hearings');
const judgeRoutes = require('./routes/judges');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Frontend')));

// Connect to database
connectDB();

// API Routes
app.use('/api/cases', caseRoutes);
app.use('/api/hearings', hearingRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/auth', authRoutes);

// Serve frontend
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});
