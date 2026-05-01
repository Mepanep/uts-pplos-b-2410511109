const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, //1 menit
    max: 60,
    message: "Terlalu banyak request, silakan coba lagi nanti."
});

app.use(limiter);

const verifyJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token tidak valid atau kadaluwarsa" });
        req.user = decoded;
        next();
    });
};

app.use('/auth', createProxyMiddleware({ 
    target: 'http://localhost:3004', 
    changeOrigin: true 
}));

app.use('/booking', verifyJWT, createProxyMiddleware({ 
    target: 'http://localhost:8000', 
    changeOrigin: true 
}));

app.use('/payment', createProxyMiddleware({ 
    target: 'http://localhost:3005', 
    changeOrigin: true 
}));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`);
});