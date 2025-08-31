export const requireSeller = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.role === 'seller' || req.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Seller access required' });
};

export const requireAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Admin access required' });
};
