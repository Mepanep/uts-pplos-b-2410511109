require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

app.get('/auth/github', (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=http://localhost:3000/auth/github/callback&scope=user:email`;
    res.redirect(url);
});

app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Code not found" });

    try {
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        }, { headers: { accept: 'application/json' } });

        const githubToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://github.com/user', {
            headers: { Authorization: `token ${githubToken}` }
        });

        const { login, email, avatar_url } = userResponse.data;

        const connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        let userId;
        if (rows.length === 0) {
            const [result] = await connection.execute(
                'INSERT INTO users (username, email, profile_photo, oauth_provider) VALUES (?, ?, ?, ?)',
                [login, email, avatar_url, 'github']
            );
            userId = result.insertId;
        } else {
            userId = rows[0].id;
        }
        await connection.end();

        const accessToken = jwt.sign(
            { id: userId, username: login }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );
        
        const refreshToken = jwt.sign(
            { id: userId }, 
            process.env.JWT_REFRESH_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            message: "Login Berhasil",
            access_token: accessToken,
            refresh_token: refreshToken,
            user: { username: login, email, photo: avatar_url }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Authentication Failed" });
    }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));