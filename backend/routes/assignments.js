const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// Get all assignments for user
router.get('/', (req, res) => {
    db.all('SELECT * FROM assignments WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Add an assignment
router.post('/', (req, res) => {
    const { title, subject, deadline, status } = req.body;
    const query = `INSERT INTO assignments (user_id, title, subject, deadline, status)
                   VALUES (?, ?, ?, ?, ?)`;
    const values = [req.user.id, title, subject, deadline, status || 'pending'];

    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ message: err.message });
        
        db.get('SELECT * FROM assignments WHERE id = ?', [this.lastID], (err, row) => {
            res.status(201).json(row);
        });
    });
});

// Update assignment status
router.put('/:id', (req, res) => {
    const { title, subject, deadline, status } = req.body;
    const query = `UPDATE assignments SET title = ?, subject = ?, deadline = ?, status = ? WHERE id = ? AND user_id = ?`;
    const values = [title, subject, deadline, status, req.params.id, req.user.id];

    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Assignment not found' });
        
        db.get('SELECT * FROM assignments WHERE id = ?', [req.params.id], (err, row) => {
            res.json(row);
        });
    });
});

// Delete an assignment
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM assignments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Assignment not found' });
        res.json({ message: 'Assignment deleted' });
    });
});

module.exports = router;
