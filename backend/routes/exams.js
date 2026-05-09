const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// Get all exams for user
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM exams WHERE user_id = $1 ORDER BY exam_date ASC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add an exam
router.post('/', async (req, res) => {
    const { subject, exam_date, room } = req.body;
    const query = `INSERT INTO exams (user_id, subject, exam_date, room)
                   VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [req.user.id, subject, exam_date, room];

    try {
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update an exam
router.put('/:id', async (req, res) => {
    const { subject, exam_date, room } = req.body;
    const query = `UPDATE exams SET subject = $1, exam_date = $2, room = $3 WHERE id = $4 AND user_id = $5 RETURNING *`;
    const values = [subject, exam_date, room, req.params.id, req.user.id];

    try {
        const result = await db.query(query, values);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Exam not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete an exam
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM exams WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Exam not found' });
        res.json({ message: 'Exam deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
