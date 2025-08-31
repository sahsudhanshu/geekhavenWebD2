import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authMiddleware from '../utils/authMiddleware.js';
import { requireSeller } from '../utils/roleMiddleware.js';
import cloudinary from '../config/cloudinary.js';
import crypto from 'crypto';

const upload = Router();

const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (/image\/(png|jpe?g|gif|webp)/i.test(file.mimetype)) cb(null, true); else cb(new Error('Invalid file type'), false);
};

const uploader = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

upload.post('/images', authMiddleware, requireSeller, uploader.array('images', 6), (req, res) => {
    const files = req.files || [];
    const urls = files.map(f => `/uploads/${f.filename}`);
    res.status(201).json({ urls });
});


export { upload };

// Cloudinary signature endpoint
upload.post('/cloudinary/sign', authMiddleware, requireSeller, async (req, res) => {
    const { folder = 'products' } = req.body || {};
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ message: 'Cloudinary not configured' });
    }
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const paramsToSign = { timestamp, folder };
        const sig = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
        res.json({ timestamp, folder, signature: sig, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Failed to sign' });
    }
});
