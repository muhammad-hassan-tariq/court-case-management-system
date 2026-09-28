const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all hearings
router.get('/', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Hearings ORDER BY hearing_date ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new hearing
router.post('/', async (req, res) => {
    try {
        const { hearing_id, case_id, case_title, hearing_date, hearing_time, courtroom, judge_name, status, remarks } = req.body;
        await sql.query(`
            INSERT INTO Hearings (hearing_id, case_id, case_title, hearing_date, hearing_time, courtroom, judge_name, status, remarks)
            VALUES ('${hearing_id}', '${case_id}', '${case_title}', '${hearing_date}', '${hearing_time}', '${courtroom}', '${judge_name}', '${status}', '${remarks || ''}')
        `);
        res.status(201).json({ message: 'Hearing created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update hearing
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { hearing_date, hearing_time, courtroom, status, remarks } = req.body;
        await sql.query(`
            UPDATE Hearings SET 
                hearing_date = '${hearing_date}',
                hearing_time = '${hearing_time}',
                courtroom = '${courtroom}',
                status = '${status}',
                remarks = '${remarks || ''}'
            WHERE hearing_id = '${id}'
        `);
        res.json({ message: 'Hearing updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete hearing
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await sql.query(`DELETE FROM Hearings WHERE hearing_id = '${id}'`);
        res.json({ message: 'Hearing deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;