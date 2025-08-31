import express from "express";
import 'dotenv/config'
import connectDB from "./src/config/database.js";
import cors from 'cors'
import { auth, product, cart, upload, order, user, checkout } from "./src/routes/index.js";
import path from 'path';
import expressStatic from 'express';

const app = express();
const recentLogs = [];
const PORT = process.env.PORT || 3000;
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI
const DB_NAME = process.env.DB_NAME || 'Test'

app.use(cors())
app.use(express.json());
app.use((req, res, next) => {
    const entry = { method: req.method, path: req.path, at: new Date().toISOString(), ip: req.ip, q: req.query, bodyKeys: Object.keys(req.body || {}) };
    recentLogs.push(entry);
    if (recentLogs.length > 50) recentLogs.shift();
    next();
});
app.get('/', (req, res) => {
    res.json({ message: "Server is Running!" })
})
app.get(`/IIT2024081/healthz`, (req, res) => { res.json({ ok: true, ts: Date.now() }); });
app.get('/logs/recent', (req, res) => {
    res.json({ items: recentLogs.slice().reverse() });
});
app.use('/api/v1/auth', auth)
app.use('/api/v1/products', product)
app.use('/api/v1/cart', cart)
app.use('/api/v1/upload', upload)
app.use('/api/v1/user', user)
app.use('/api/v1/orders', order)
app.use('/api/v1/checkout', checkout)
app.use('/uploads', expressStatic.static(path.resolve('uploads')))

connectDB(MONGODB_CONNECTION_URI, DB_NAME).then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server`);
        console.log(`URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
    })
}).catch((e) => {
    console.log(e)
})