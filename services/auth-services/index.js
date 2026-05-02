require('dotenv').config();
console.log("ID GitHub:", process.env.GITHUB_CLIENT_ID);
const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
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

let connection;

async function initDB() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Database db_auth_service terhubung!");
    } catch (err) {
        console.error("Gagal koneksi database:", err.message);
    }
}

initDB();

app.get('/github', (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=http://localhost:3000/auth/github/callback&scope=user:email`;
    res.redirect(url);
});

app.get('/github/callback', async (req, res) => {
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

        // PERBAIKAN DISINI: Menangani data undefined agar MySQL tidak error
        const data = userResponse.data;
        const login = data.login || 'UserGitHub';
        const userEmail = data.email || `${login}@github.com`; 
        const avatar_url = data.avatar_url || null; // Gunakan null jika tidak ada foto

        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [userEmail]);
        
        let userId;
        if (rows.length === 0) {
            const [result] = await connection.execute(
                'INSERT INTO users (username, email, profile_photo, oauth_provider) VALUES (?, ?, ?, ?)',
                [login, userEmail, avatar_url, 'github']
            );
            userId = result.insertId;
        } else {
            userId = rows[0].id;
        }

        const accessToken = jwt.sign(
            { id: userId, username: login }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({
            status: "success",
            message: "Login Berhasil via GitHub",
            access_token: accessToken,
            user: { username: login, email: userEmail }
        });

    } catch (error) {
        console.error("OAuth Detail Error:", error.message);
        res.status(500).json({ error: "OAuth Failed", details: error.message });
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        await connection.execute(
            'INSERT INTO users (username, email, password, oauth_provider) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, 'local']
        );
        res.status(201).json({ message: "User berhasil didaftarkan" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: "User tidak ditemukan" });

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) return res.status(401).json({ message: "Password salah" });

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.json({ accessToken, refreshToken, user: { username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/me', verifyJWT, async (req, res) => {
    try {
        const [rows] = await connection.execute(
            'SELECT id, username, email, profile_photo FROM users WHERE id = ?', 
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.json({
            message: "Data profil berhasil diambil",
            user: rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/update', verifyJWT, async (req, res) => {
    const username = req.body.username || null;
    const email = req.body.email || null;
    const profile_photo = req.body.profile_photo || null;
    
    const userId = req.user ? req.user.id : null;

    console.log("Data yang diterima:", { username, email, profile_photo, userId });

    if (!userId) {
        return res.status(401).json({ error: "User ID tidak ditemukan dalam token" });
    }

    try {
        const [result] = await connection.execute(
            'UPDATE users SET username = ?, email = ?, profile_photo = ? WHERE id = ?',
            [username, email, profile_photo, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Gagal update, user tidak ditemukan" });
        }

        res.json({ 
            status: 'success', 
            message: "Profil berhasil diperbarui"
        });
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/delete', verifyJWT, async (req, res) => {
    const userId = req.user ? req.user.id : null;

    console.log("Mencoba menghapus User ID:", userId);

    if (!userId) {
        return res.status(401).json({ error: "User ID tidak ditemukan dalam token" });
    }

    try {
        const [result] = await connection.execute(
            'DELETE FROM users WHERE id = ?', 
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Gagal menghapus, user tidak ditemukan" });
        }

        res.json({ 
            status: 'success', 
            message: "Akun berhasil dihapus selamanya dari sistem" 
        });
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));