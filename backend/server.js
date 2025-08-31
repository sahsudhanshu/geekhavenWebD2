import express from "express";
import 'dotenv/config'
import connectDB from "./src/config/database.js";
import cors from 'cors'
import { auth, product, cart, upload } from "./src/routes/index.js";
import path from 'path';
import expressStatic from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI
const DB_NAME = process.env.DB_NAME || 'Test'

app.use(cors())
app.use(express.json());
app.use(async (req, res, next) => {
    console.log(req.query)
    console.log(req.params)
    console.log(req.body)
    next()
})
app.get('/', (req, res) => {
    res.json({ message: "Server is Running!" })
})
app.use('/api/v1/auth', auth)
app.use('/api/v1/products', product)
app.use('/api/v1/cart', cart)
app.use('/api/v1/upload', upload)
app.use('/uploads', expressStatic.static(path.resolve('uploads')))

connectDB(MONGODB_CONNECTION_URI, DB_NAME).then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server`);
        console.log(`URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
    })
}).catch((e) => {
    console.log(e)
})