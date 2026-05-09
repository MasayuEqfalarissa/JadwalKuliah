const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// Get all schedules
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM schedules WHERE user_id = $1', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a schedule
router.post('/', async (req, res) => {
    const { course_name, lecturer, room, day, start_time, end_time, color } = req.body;
    const query = `INSERT INTO schedules (user_id, course_name, lecturer, room, day, start_time, end_time, color)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const values = [req.user.id, course_name, lecturer, room, day, start_time, end_time, color || '#3B82F6'];

    try {
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a schedule
router.put('/:id', async (req, res) => {
    const { course_name, lecturer, room, day, start_time, end_time, color } = req.body;
    const query = `UPDATE schedules SET course_name = $1, lecturer = $2, room = $3, day = $4, start_time = $5, end_time = $6, color = $7
                   WHERE id = $8 AND user_id = $9 RETURNING *`;
    const values = [course_name, lecturer, room, day, start_time, end_time, color, req.params.id, req.user.id];

    try {
        const result = await db.query(query, values);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Schedule not found or unauthorized' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM schedules WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Schedule not found or unauthorized' });
        res.json({ message: 'Schedule deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
