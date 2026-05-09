const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Register
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.get(checkQuery, [email], async (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        if (row) return res.status(400).json({ message: 'User already exists' });

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.run(insertQuery, [name, email, hashedPassword], function(err) {
                if (err) return res.status(500).json({ message: err.message });
                
                const token = jwt.sign({ id: this.lastID, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
                res.status(201).json({ token, user: { id: this.lastID, name, email, profile_picture: null } });
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, profile_picture: user.profile_picture } });
    });
});

// Get Current User
router.get('/me', require('../middleware/auth'), (req, res) => {
    db.get('SELECT id, name, email, profile_picture FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    });
});

// Upload Profile Picture
router.post('/profile-picture', require('../middleware/auth'), upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const profile_picture = `/uploads/${req.file.filename}`;
    
    db.run('UPDATE users SET profile_picture = ? WHERE id = ?', [profile_picture, req.user.id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ profile_picture });
    });
});

module.exports = router;
