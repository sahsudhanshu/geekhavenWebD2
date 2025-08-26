import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
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

cart.post('/', authMiddleware, async (req, res) => {
    const { pId, quantity } = req.body;
    try {
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

cart.delete('/:id', authMiddleware, async (req, res) => {
    const { pId } = req.params;
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