require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const SECRET = "your_super_secret_key";
let db;

// Initialize Database & Tables
(async () => {
    db = await open({ filename: './database.db', driver: sqlite3.Database });
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, password TEXT, role TEXT);
        CREATE TABLE IF NOT EXISTS menu (id INTEGER PRIMARY KEY, name TEXT, price REAL, image TEXT);
        CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, user_id INTEGER, items TEXT, status TEXT DEFAULT 'Pending');
    `);
})();

// --- AUTHENTICATION ---
app.post('/api/register', async (req, res) => {
    const { email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashed, role || 'customer']);
    res.json({ message: "User registered!" });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
        res.json({ token, role: user.role });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// --- MENU & ORDERS ---
app.get('/api/menu', async (req, res) => {
    const items = await db.all('SELECT * FROM menu');
    res.json(items);
});

app.post('/api/orders', async (req, res) => {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, SECRET);
    await db.run('INSERT INTO orders (user_id, items) VALUES (?, ?)', [decoded.id, JSON.stringify(req.body.items)]);
    res.json({ message: "Order placed!" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
