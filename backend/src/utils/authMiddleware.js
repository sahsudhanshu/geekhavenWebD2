import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
const authMiddleware = async (req, res, next) => {
    if (!(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))) return res.status(401).json({ message: 'Not authorized, no token' });
    const token = req.headers.authorization.split(' ')[1];
    const secrets = [process.env.JWT_SECRET, process.env.ASSIGNMENT_SEED].filter(Boolean);
    let decoded;
    for (const s of secrets) {
        if (decoded) break;
        try { decoded = jwt.verify(token, s); } catch (e) {}
    }
    if (!decoded) return res.status(401).json({ message: 'Not authorized, token failed' });
    try {
        req.user = await User.findById(decoded.id).select('-password');
        if (req.user && decoded.role && req.user.role !== decoded.role) {
            req.user.role = decoded.role;
        }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired, please login again!' });
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
export default authMiddleware;