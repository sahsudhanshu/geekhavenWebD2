import { Router } from 'express';
import User from '../models/User.js';
import authMiddleware from '../utils/authMiddleware.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } });

const user = Router()
user.use(authMiddleware);
user.get('/', async (req, res) => {
    try {
    const u = await User.findById(req.user._id).populate('likedProducts bookmarkedProducts');
    res.json(u);
    }
    catch (e) {
        console.log(e)
        res.json({ message: 'Server Error' });
    }
})

user.put('/profile', upload.single('avatar'), async (req, res) => {
    try {
        const { name, contactNumber } = req.body;
        const u = await User.findById(req.user._id);
        if (!u) return res.status(404).json({ message: 'User not found' });
        if (name) u.name = name;
        if (contactNumber) u.contactNumber = contactNumber;
        if (req.file) {
            const prevPublicId = u.avatar?.publicId;
            const buffer = req.file.buffer;
            try {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ folder: 'avatars' }, (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    });
                    stream.end(buffer);
                });
                if (uploadResult?.secure_url) {
                    u.avatar = { url: uploadResult.secure_url, publicId: uploadResult.public_id };
                    if (prevPublicId) {
                        (async () => { try { await cloudinary.uploader.destroy(prevPublicId); } catch { } })();
                    }
                }
            } catch (e) {
                console.error('Avatar upload failed', e);
                return res.status(500).json({ message: 'Avatar upload failed' });
            }
        }
        await u.save();
        res.json({ message: 'Profile updated', user: u });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default user