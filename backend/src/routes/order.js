import { Router } from 'express';
import authMiddleware from '../utils/authMiddleware.js';
import { Order, Product, Cart } from '../models/index.js';

const order = Router();

order.get('/', authMiddleware, async (req, res) => {
    try {
        let { cursor, limit = 10 } = req.query;
        const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
        const query = { user: req.user.id };
        if (cursor) {
            const date = new Date(cursor);
            if (isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid cursor' });
            query.createdAt = { $lt: date };
        }
        const docs = await Order.find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(lim + 1)
            .select('orderNumber createdAt status subtotal total currency lineItems');
        let nextCursor = null;
        let items = docs;
        if (docs.length > lim) {
            const last = docs[lim - 1];
            nextCursor = last.createdAt.toISOString();
            items = docs.slice(0, lim);
        }
        const mapped = items.map(o => ({
            _id: o._id,
            orderNumber: o.orderNumber,
            createdAt: o.createdAt,
            status: o.status,
            subtotal: o.subtotal,
            total: o.total,
            currency: o.currency,
            lineItems: o.lineItems.map(li => ({
                product: li.product, // may be null if deleted
                name: li.productSnapshot?.name,
                image: li.productSnapshot?.image,
                price: li.unitPrice,
                quantity: li.quantity,
                subtotal: li.extendedPrice
            }))
        }));
        res.json({ items: mapped, nextCursor });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server Error' });
    }
});

order.get('/:id', authMiddleware, async (req, res) => {
    try {
        const o = await Order.findOne({ _id: req.params.id, user: req.user.id });
        if (!o) return res.status(404).json({ message: 'Order not found' });
        res.json(o);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server Error' });
    }
});

order.post('/', authMiddleware, async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        if (!shippingAddress || !shippingAddress.line1) return res.status(400).json({ message: 'Shipping address required' });
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
        const orderDoc = await Order.create({
            user: req.user.id,
            lineItems,
            shippingAddress,
            subtotal: 0,
            total: 0
        });
        cart.items = [];
        await cart.save();
        res.status(201).json(orderDoc);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server Error' });
    }
});

order.post('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const o = await Order.findOne({ _id: req.params.id, user: req.user.id });
        if (!o) return res.status(404).json({ message: 'Order not found' });
        if (!['Pending', 'Processing'].includes(o.status)) return res.status(400).json({ message: 'Order not cancellable' });
        o.status = 'Cancelled';
        o.timeline.push({ status: 'Cancelled', note: 'User cancelled' });
        o.cancelledAt = new Date();
        await o.save();
        res.json({ message: 'Order cancelled', order: o });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server Error' });
    }
});

export { order };
