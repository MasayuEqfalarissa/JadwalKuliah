const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// Get all exams for user
router.get('/', (req, res) => {
    db.all('SELECT * FROM exams WHERE user_id = ? ORDER BY exam_date ASC', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Add an exam
router.post('/', (req, res) => {
    const { subject, exam_date, room } = req.body;
    const query = `INSERT INTO exams (user_id, subject, exam_date, room)
                   VALUES (?, ?, ?, ?)`;
    const values = [req.user.id, subject, exam_date, room];

    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ message: err.message });
        
        db.get('SELECT * FROM exams WHERE id = ?', [this.lastID], (err, row) => {
            res.status(201).json(row);
        });
    });
});

// Update an exam
router.put('/:id', (req, res) => {
    const { subject, exam_date, room } = req.body;
    const query = `UPDATE exams SET subject = ?, exam_date = ?, room = ? WHERE id = ? AND user_id = ?`;
    const values = [subject, exam_date, room, req.params.id, req.user.id];

    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Exam not found' });
        
        db.get('SELECT * FROM exams WHERE id = ?', [req.params.id], (err, row) => {
            res.json(row);
        });
    });
});

// Delete an exam
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM exams WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Exam not found' });
        res.json({ message: 'Exam deleted' });
    });
});

module.exports = router;
