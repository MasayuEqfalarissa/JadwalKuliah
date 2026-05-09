const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// Get all assignments for user
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM assignments WHERE user_id = $1', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add an assignment
router.post('/', async (req, res) => {
    const { title, subject, deadline, status } = req.body;
    const query = `INSERT INTO assignments (user_id, title, subject, deadline, status)
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [req.user.id, title, subject, deadline, status || 'pending'];

    try {
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update assignment status
router.put('/:id', async (req, res) => {
    const { title, subject, deadline, status } = req.body;
    const query = `UPDATE assignments SET title = $1, subject = $2, deadline = $3, status = $4 WHERE id = $5 AND user_id = $6 RETURNING *`;
    const values = [title, subject, deadline, status, req.params.id, req.user.id];

    try {
        const result = await db.query(query, values);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Assignment not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete an assignment
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM assignments WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Assignment not found' });
        res.json({ message: 'Assignment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
