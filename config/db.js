const sql = require('mssql');

const config = {
    server: 'DESKTOP-D86LV5L\\SQLEXPRESS',
    database: 'CourtCaseDB',
    port: 1433,
    user: 'sa',
    password: 'Court123!',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 30000,
        requestTimeout: 30000,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
    }
};

let pool = null;

async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('✅ SQL Server connected successfully');
        pool.on('error', async (err) => {
            console.error('Pool error, reconnecting...', err.message);
            await reconnect();
        });
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        console.log('Retrying in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
}

async function reconnect() {
    try {
        pool = await sql.connect(config);
        console.log('✅ Reconnected to SQL Server');
    } catch (err) {
        console.error('Reconnect failed, retrying in 5 seconds...');
        setTimeout(reconnect, 5000);
    }
}

function getPool() {
    return pool;
}

module.exports = { connectDB, sql, getPool };