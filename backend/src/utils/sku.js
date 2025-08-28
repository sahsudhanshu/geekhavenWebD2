const ASSIGNMENT_SEED = process.env.ASSIGNMENT_SEED || "";
const seedNumber = parseInt(ASSIGNMENT_SEED.split("-")[1]);
if (!ASSIGNMENT_SEED || !Number.isInteger(seedNumber)) {
    throw new Error("❌ ASSIGNMENT_SEED is missing or invalid. Please set env variable like GHW25-123.");
}
export function computeChecksum(id) {
    return (parseInt(id, 16) + seedNumber) % 10;
}
export function generateSku(pId) {
    const id = pId.toString().slice(-6);
    const checksum = computeChecksum(id)
    return `${id}-${checksum}`;
}
export function verifySku(sku) {
    const [pId, checksum] = sku.split("-");
    if (!pId || !checksum) return false;
    return parseInt(checksum) === computeChecksum(pId);
}