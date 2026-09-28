const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all judges
router.get('/', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Judges ORDER BY judge_name');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;