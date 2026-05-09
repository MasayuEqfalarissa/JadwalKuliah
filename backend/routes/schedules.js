const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// Get all schedules for logged in user
router.get('/', (req, res) => {
    db.all('SELECT * FROM schedules WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Add a schedule
router.post('/', (req, res) => {
    const { course_name, lecturer, room, day, start_time, end_time, color } = req.body;
    const query = `INSERT INTO schedules (user_id, course_name, lecturer, room, day, start_time, end_time, color)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [req.user.id, course_name, lecturer, room, day, start_time, end_time, color || '#3B82F6'];

    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ message: err.message });
        
        db.get('SELECT * FROM schedules WHERE id = ?', [this.lastID], (err, row) => {
            res.status(201).json(row);
        });
    });
});

// Update a schedule
router.put('/:id', (req, res) => {
    const { course_name, lecturer, room, day, start_time, end_time, color } = req.body;
    const query = `UPDATE schedules SET course_name = ?, lecturer = ?, room = ?, day = ?, start_time = ?, end_time = ?, color = ?
                   WHERE id = ? AND user_id = ?`;
    const values = [course_name, lecturer, room, day, start_time, end_time, color, req.params.id, req.user.id];

    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Schedule not found or unauthorized' });
        
        db.get('SELECT * FROM schedules WHERE id = ?', [req.params.id], (err, row) => {
            res.json(row);
        });
    });
});

// Delete a schedule
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM schedules WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Schedule not found or unauthorized' });
        res.json({ message: 'Schedule deleted' });
    });
});

module.exports = router;
