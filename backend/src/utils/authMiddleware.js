import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
const authMiddleware = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decodedUserId = jwt.verify(token, process.env.JWT_SECRET).id;
            req.user = await User.findById(decodedUserId).select('-password');
            next();
        } catch (error) {
            console.error(error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired, please login again!' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export default authMiddleware;