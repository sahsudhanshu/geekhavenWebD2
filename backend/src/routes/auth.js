import { Router } from "express";
import { User } from "../models/index.js";
import generateToken from './../utils/tokenGenerator.js';
import jwt from 'jsonwebtoken';
import authMiddleware from '../utils/authMiddleware.js';
import { requireAdmin } from '../utils/roleMiddleware.js';

const auth = Router()
auth.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Proper inputs not provided !" })
    }
    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        const user = await User.create({ name, email: email.toLowerCase(), password });
        return res.status(201).json({
            message: 'User registered successfully',
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
});

auth.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const match = await user.matchPassword(password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        return res.status(200).json({
            message: 'Login successful',
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
});

auth.post('/validate', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired, please login again!' });
        }
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
});

auth.post('/promote/:id/seller', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.role = 'seller';
        await user.save();
        res.status(200).json({ message: 'User promoted to seller', id: user._id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
});

auth.post('/self/upgrade-seller', authMiddleware, async (req, res) => {
    try {
        const { phone, address } = req.body || {};
        if (!phone || !address || !address.name || !address.mobileNumber || !address.address_line_1 || !address.pincode || !address.state || !address.district) {
            return res.status(400).json({ message: 'Complete seller phone and address required' });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'seller') return res.status(200).json({ message: 'Already seller' });
        user.contactNumber = phone;
        if (!user.addresses || user.addresses.length === 0) {
            user.addresses = [address];
        }
        user.role = 'seller';
        await user.save();
        res.status(200).json({ message: 'Upgraded to seller' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
});

export { auth };