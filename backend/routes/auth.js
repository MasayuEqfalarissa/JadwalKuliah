const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'studysync_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});
const upload = multer({ storage });

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        const checkResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkResult.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertQuery = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email';
        const insertResult = await db.query(insertQuery, [name, email, hashedPassword]);
        const newUser = insertResult.rows[0];
        
        const token = jwt.sign({ id: newUser.id, name: newUser.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { ...newUser, profile_picture: null } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, profile_picture: user.profile_picture } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Current User
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, profile_picture FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload Profile Picture
router.post('/profile-picture', require('../middleware/auth'), upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    // Cloudinary returns the secure URL in req.file.path
    const profile_picture = req.file.path;
    
    try {
        await db.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [profile_picture, req.user.id]);
        res.json({ profile_picture });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
