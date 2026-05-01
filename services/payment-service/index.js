require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

app.post('/process', async (req, res) => {
    const { booking_id, amount, payment_method } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const transaction_id = 'PAY-' + Date.now();

        await connection.execute(
            'INSERT INTO payments (booking_id, amount, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?)',
            [booking_id, amount, payment_method, 'success', transaction_id]
        );

        await connection.end();

        res.status(201).json({
            status: 'success',
            message: 'Pembayaran berhasil dicatat',
            data: { transaction_id, booking_id, amount }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));