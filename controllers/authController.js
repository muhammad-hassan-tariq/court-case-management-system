const { getPool } = require('../config/db');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = getPool();

        if (!pool) {
            return res.status(500).json({ success: false, message: 'Database not connected' });
        }

        const result = await pool.request()
            .input('username', username)
            .input('password', password)
            .query('SELECT * FROM Users WHERE username = @username AND password = @password');

        if (result.recordset.length > 0) {
            res.json({ success: true, message: 'Login successful', user: result.recordset[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { login };