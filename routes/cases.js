const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all cases
router.get('/', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Cases ORDER BY filed_date DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single case
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql.query(`SELECT * FROM Cases WHERE case_id = '${id}'`);
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Case not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new case
router.post('/', async (req, res) => {
    try {
        const { case_id, case_title, plaintiff, defendant, filed_date, status, assigned_judge_id, assigned_judge_name } = req.body;
        await sql.query(`
            INSERT INTO Cases (case_id, case_title, plaintiff, defendant, filed_date, status, assigned_judge_id, assigned_judge_name)
            VALUES ('${case_id}', '${case_title}', '${plaintiff}', '${defendant}', '${filed_date}', '${status}', ${assigned_judge_id || null}, '${assigned_judge_name}')
        `);
        res.status(201).json({ message: 'Case created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update case
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { case_title, plaintiff, defendant, filed_date, status, assigned_judge_id, assigned_judge_name } = req.body;
        await sql.query(`
            UPDATE Cases SET 
                case_title = '${case_title}',
                plaintiff = '${plaintiff}',
                defendant = '${defendant}',
                filed_date = '${filed_date}',
                status = '${status}',
                assigned_judge_id = ${assigned_judge_id || null},
                assigned_judge_name = '${assigned_judge_name}'
            WHERE case_id = '${id}'
        `);
        res.json({ message: 'Case updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete case
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await sql.query(`DELETE FROM Hearings WHERE case_id = '${id}'`);
        await sql.query(`DELETE FROM Cases WHERE case_id = '${id}'`);
        res.json({ message: 'Case deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;