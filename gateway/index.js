require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 60,
    message: { message: "Terlalu banyak request, silakan coba lagi nanti." }
});

app.use(limiter);

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan, silakan login terlebih dahulu" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'rahasia_super_pendek_15_menit', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token tidak valid atau kadaluwarsa" });
        }
        req.user = decoded;
        next();
    });
};

app.use('/auth', createProxyMiddleware({ 
    target: 'http://localhost:3004', 
    changeOrigin: true 
}));

app.use('/auth/me', verifyJWT, createProxyMiddleware({ 
    target: 'http://localhost:3004/auth/me', 
    changeOrigin: true,
    ignorePath: true
}));

app.use('/api/fields', verifyJWT, createProxyMiddleware({ 
    target: 'http://127.0.0.1:8000/api/fields', 
    changeOrigin: true,
    ignorePath: true
}));

app.use('/api/categories', verifyJWT, createProxyMiddleware({ 
    target: 'http://localhost:8000/api/categories', 
    changeOrigin: true,
    ignorePath: true
}));

app.use('/api/book', verifyJWT, createProxyMiddleware({ 
    target: 'http://127.0.0.1:8000/api/book', 
    changeOrigin: true,
    ignorePath: true
}));

app.use('/payment', createProxyMiddleware({ 
    target: 'http://localhost:3005', 
    changeOrigin: true 
}));

app.use('/api/payment/process', verifyJWT, createProxyMiddleware({ 
    target: 'http://localhost:3005/process', 
    changeOrigin: true,
    ignorePath: true 
}));

app.use('/api/payment/history', verifyJWT, createProxyMiddleware({ 
    target: 'http://localhost:3005/history', 
    changeOrigin: true,
    ignorePath: true 
}));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[OK] API Gateway running on http://localhost:${PORT}`);
});