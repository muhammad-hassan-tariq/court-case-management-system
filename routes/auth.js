const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const result = await sql.query(`
        SELECT * FROM Users
        WHERE username = @username
        AND password = @password
        `);
        
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