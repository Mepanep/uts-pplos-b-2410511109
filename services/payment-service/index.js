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
            'INSERT INTO payments (booking_id, amount, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?)',
            [booking_id, amount, payment_method, 'success', transaction_id]
        );

        await connection.execute(
            'UPDATE db_booking_service.bookings SET status = ? WHERE id = ?',
            ['success', booking_id]
        );

        await connection.end();

        res.status(201).json({
            status: 'success',
            message: 'Pembayaran berhasil dan status pesanan telah diperbarui',
            data: { transaction_id, booking_id, amount }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/history', verifyJWT, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM payments ORDER BY created_at DESC'
        );
        
        await connection.end();
        res.json({ status: 'success', data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/payments/:id', verifyJWT, async (req, res) => {
    const paymentId = req.params.id;
    const { status, payment_method, transaction_id } = req.body;

    const validStatus = ['pending', 'success', 'failed'];
    if (status && !validStatus.includes(status)) {
        return res.status(400).json({ status: 'error', message: 'Status tidak valid' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [result] = await connection.execute(
            'UPDATE payments SET status = ?, payment_method = ?, transaction_id = ? WHERE id = ?',
            [
                status || 'pending', 
                payment_method || null, 
                transaction_id || null, 
                paymentId
            ]
        );

        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Data pembayaran tidak ditemukan' });
        }

        res.json({
            status: 'success',
            message: 'Data pembayaran berhasil diperbarui'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.delete('/payments/:id', verifyJWT, async (req, res) => {
    const paymentId = req.params.id;

    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [result] = await connection.execute(
            'DELETE FROM payments WHERE id = ?', 
            [paymentId]
        );

        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Data pembayaran tidak ditemukan' });
        }

        res.json({ status: 'success', message: 'Log transaksi berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));