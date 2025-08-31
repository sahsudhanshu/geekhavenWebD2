import crypto from 'crypto';
const ASSIGNMENT_SEED = process.env.ASSIGNMENT_SEED || '';
const seedNumber = (() => {
    try {
        const part = ASSIGNMENT_SEED.split('-')[1];
        const n = parseInt(part, 10);
        if (Number.isNaN(n)) return 0;
        return n;
    } catch { return 0; }
})();

export function computePlatformFee(subtotal) {
    const fee = Math.floor((subtotal * 0.017) + seedNumber);
    return fee;
}

export function signBody(body) {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const h = crypto.createHmac('sha256', ASSIGNMENT_SEED);
    h.update(payload);
    return h.digest('hex');
}

export function getSeedNumber() { return seedNumber; }
