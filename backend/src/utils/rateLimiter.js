const loginAttempts = {};

const rateLimiter = (maxAttempts = 10, minTime = 15 * 60 * 1000) => {
    return ((req, res, next) => {
        const ip = req.ip;
        const now = Date.now();

        if (!loginAttempts[ip]) {
            loginAttempts[ip] = { count: 1, time: now };
            return next()
        }

        const lastAttempt = loginAttempts[ip]

        if (now - lastAttempt.time >= minTime) {
            loginAttempts[ip] = { count: 1, time: now }
            return next()
        }

        if (lastAttempt.count >= maxAttempts) {
            return res.status(429).json({ message: 'Too many attempts, try again later.' });
        }

        loginAttempts[ip].count += 1; 
        next();
    })
}
export default rateLimiter;