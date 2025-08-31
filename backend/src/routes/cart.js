import { Router } from "express";
import authMiddleware from "../utils/authMiddleware.js";
import { Cart } from "../models/index.js";

const cart = Router()

cart.get('/', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product')
        if (!cart) {
            return res.json({ items: [] })
        }
        res.status(200).json(cart);
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Server Error' });
    }
})

cart.post('/:id', authMiddleware, async (req, res) => {
    const pId = req.params.id
    const { quantity } = req.body;
    try {
        if (quantity === undefined || isNaN(quantity)) {
            return res.status(400).json({ message: 'Quantity is required and must be a number.' });
        }
        let cart = await Cart.findOne({ user: req.user.id })
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] })
        }
        const eItem = cart.items.find(item => item.product.toString() === pId)
        if (eItem) {
            eItem.quantity = Number(quantity || 1);
        }
        else {
            cart.items.push({ product: pId, quantity: quantity || 1 })
        }
        await cart.save()
        const newCart = await cart.populate('items.product')
        res.status(200).json(newCart);
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Server Error' });
    }
})

cart.post('/', authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined || isNaN(quantity)) return res.status(400).json({ message: 'productId and quantity required' });
    try {
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) cart = new Cart({ user: req.user.id, items: [] });
        const eItem = cart.items.find(i => i.product.toString() === productId);
        if (eItem) eItem.quantity = Number(quantity || 1); else cart.items.push({ product: productId, quantity: quantity || 1 });
        await cart.save();
        const newCart = await cart.populate('items.product');
        res.json(newCart);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

cart.put('/:id', authMiddleware, async (req, res) => {
    const pId = req.params.id
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(quantity)) {
        return res.status(400).json({ message: 'Quantity is required and must be a number.' });
    }

    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        const itemToUpdate = cart.items.find(item => item.product.toString() === pId);
        if (!itemToUpdate) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.product.toString() !== pId);
        } else {
            itemToUpdate.quantity = quantity;
        }
        await cart.save();
        const updatedCart = await cart.populate('items.product', 'name price imageUrl');
        res.json(updatedCart);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
})

cart.delete('/:id', authMiddleware, async (req, res) => {
    const pId = req.params.id;
    try {
        let cart = await Cart.findOne({ user: req.user.id })
        if (!cart) {
            return res.status(404).json({ message: 'Cart is Empty!' })
        }
        cart.items = cart.items.filter(item => item.product.toString() !== pId)
        await cart.save()
        const newCart = await cart.populate('items.product')
        res.status(200).json(newCart);
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Server Error' });
    }
})

export { cart }