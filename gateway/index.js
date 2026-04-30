const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

app.use('/auth', createProxyMiddleware({ 
    target: 'http://localhost:3004', 
    changeOrigin: true 
}));

app.use('/booking', createProxyMiddleware({ 
    target: 'http://localhost:8000', 
    changeOrigin: true 
}));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`);
});