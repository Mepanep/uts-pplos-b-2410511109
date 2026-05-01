require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token tidak valid" });
        req.user = decoded;
        next();
    });
};

app.post('/process', verifyJWT, async (req, res) => {
    const { booking_id, amount, payment_method } = req.body;
    const user_id = req.user.id;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const transaction_id = 'PAY-' + Date.now();

        await connection.execute(
            'INSERT INTO payments (user_id, booking_id, amount, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, booking_id, amount, payment_method, 'success', transaction_id]
        );

        await connection.end();

        res.status(201).json({
            status: 'success',
            message: 'Pembayaran berhasil dicatat',
            data: { transaction_id, booking_id, amount, user_id }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/history', verifyJWT, async (req, res) => {
    const user_id = req.user.id;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
            [user_id]
        );
        
        await connection.end();
        res.json({ status: 'success', data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));