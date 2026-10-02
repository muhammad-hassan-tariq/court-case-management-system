const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = getPool();

        const result = await pool.request()
            .input('username', username)
            .input('password', password)
            .query('SELECT * FROM Users WHERE username = @username AND password = @password');

        if (result.recordset.length > 0) {
            res.json({
                success: true,
                message: 'Login successful',
                user: result.recordset[0]
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;