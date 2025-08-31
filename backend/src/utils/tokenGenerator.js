import jwt from 'jsonwebtoken';
const seed = process.env.ASSIGNMENT_SEED || '';
const baseSecret = process.env.JWT_SECRET || seed;
const generateToken = (id, role) => {
    const payload = { id };
    if (role) payload.role = role;
    if (role === 'admin' && seed) {
        payload.seedSig = Buffer.from(require('crypto').createHash('sha256').update(seed + ':' + id).digest('hex').slice(0, 16)).toString('base64');
        return jwt.sign(payload, seed, { expiresIn: '1h' });
    }
    return jwt.sign(payload, baseSecret, { expiresIn: '1h' });
};
export default generateToken;