import { Router } from "express";
import { Product } from "../models/index.js";
import authMiddleware from "../utils/authMiddleware.js";

const product = Router()
product.post('/', authMiddleware, async (req, res) => {
    try {
        console.log(req)
        const { name, description, price, category, condition, usedCondition, images, status, stock } = req.body;
        const product = await Product.create({
            name, description, price,
            category, condition, images, status,
            stock, usedCondition, seller: req.user.id
        })
        res.status(201).json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
})

product.get('/', async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})
product.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email')

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})
product.put('/:id', authMiddleware, async (req, res) => {
    try {
        console.log('hell')
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        const { name, description, price, category, condition, images, usedCondition, stock, status } = req.body;
        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.condition = condition ?? product.condition;
        product.usedCondition = usedCondition ?? product.usedCondition;
        product.images = images ?? product.images;
        product.status = status ?? product.status;
        product.stock = stock ?? product.stock;


        const updatedProduct = await product.save();
        res.json(updatedProduct);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})
product.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found!' });
        }
        if (product.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized for the product!' });
        }

        await product.deleteOne();
        res.json({ message: 'Product removed successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

export { product };