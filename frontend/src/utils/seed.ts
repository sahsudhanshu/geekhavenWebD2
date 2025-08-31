export type SeedInfo = {
    seed: string
    numberPart: number
}

export function getFrontSeed(): SeedInfo | null {
    const seed = import.meta.env.VITE_FRONT_ASSIGNMENT_SEED || ""
    if (!seed) return null
    const m = seed.match(/\d+/g)
    const num = m ? Number(m.join("").slice(-6)) : 0
    return { seed, numberPart: isNaN(num) ? 0 : num }
}

export function computeFrontPlatformFee(subtotal: number): number {
    const info = getFrontSeed()
    const pct = info ? info.numberPart % 10 : 0
    return +(subtotal * (pct / 100)).toFixed(2)
}

export function seededChecksum(baseId: string): string {
    const info = getFrontSeed()
    const seedNum = info ? info.numberPart : 0
    let sum = 0

    for (let i = 0; i < baseId.length; i++) {
        const n = (baseId.charCodeAt(i) + (seedNum % 97)) % 10
        const dbl = i % 2 === 0 ? n * 2 : n
        sum += Math.floor(dbl / 10) + (dbl % 10)
    }

    const check = (10 - (sum % 10)) % 10
    return `${baseId}${check}`
}

export function getPlatformFeePercent(): number {
    const info = getFrontSeed()
    return info ? info.numberPart % 10 : 0
}

export const generateColor = (seed: string): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const h = Math.abs(hash % 360);
    const s = 60 + Math.abs(hash % 15);
    let l = 45 + Math.abs(hash % 10);
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};