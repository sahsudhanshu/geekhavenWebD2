import { Router } from 'express';
import authMiddleware from '../utils/authMiddleware.js';
import rateLimiter from '../utils/rateLimiter.js';
import { Cart, Order } from '../models/index.js';
import { computePlatformFee, signBody } from '../utils/fee.js';

const idemStore = new Map();
const IDEM_TTL_MS = 5 * 60 * 1000;
function cleanupIdem() {
  const now = Date.now();
  for (const [k, v] of idemStore.entries()) {
    if (now - v.at > IDEM_TTL_MS) idemStore.delete(k);
  }
}
setInterval(cleanupIdem, 60 * 1000).unref();

const checkout = Router();

checkout.post('/', authMiddleware, rateLimiter(7, 60 * 1000), async (req, res) => {
  try {
    const idemKey = req.header('Idempotency-Key');
    if (!idemKey) return res.status(400).json({ message: 'Idempotency-Key header required' });
    const existing = idemStore.get(idemKey);
    if (existing) {
      res.set('X-Idempotent', 'true');
      res.set('X-Signature', existing.signature);
      return res.status(200).json(existing.body);
    }
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || !cart.items.length) return res.status(400).json({ message: 'Cart empty' });
    const lineItems = cart.items.map(ci => ({
      product: ci.product?._id,
      productSnapshot: {
        productId: ci.product?._id,
        name: ci.product?.name,
        image: ci.product?.images?.[0]?.url,
        price: ci.product?.price
      },
      quantity: ci.quantity,
      unitPrice: ci.product?.price,
      extendedPrice: ci.product?.price * ci.quantity
    }));
    const subtotal = lineItems.reduce((s, li) => s + li.extendedPrice, 0);
    const platformFee = computePlatformFee(subtotal);
    const shippingAddress = req.body?.shippingAddress || { line1: 'Not Provided' };
    const order = await Order.create({
      user: req.user.id,
      lineItems,
      subtotal,
      platformFee,
      shippingAddress,
      total: 0 // will be recalculated in pre-validate
    });
    cart.items = [];
    await cart.save();
    const responseBody = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      platformFee: order.platformFee,
      total: order.total,
      currency: order.currency,
      lineItems: order.lineItems.map(li => ({
        name: li.productSnapshot?.name,
        price: li.unitPrice,
        quantity: li.quantity,
        subtotal: li.extendedPrice
      }))
    };
    const signature = signBody(responseBody);
    idemStore.set(idemKey, { at: Date.now(), body: responseBody, signature });
    res.set('X-Signature', signature);
    res.status(201).json(responseBody);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
});

export { checkout };
