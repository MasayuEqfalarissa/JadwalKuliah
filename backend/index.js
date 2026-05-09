require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/schedules');
const assignmentRoutes = require('./routes/assignments');
const examRoutes = require('./routes/exams');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/exams', examRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
