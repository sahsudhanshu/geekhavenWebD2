import { Router } from "express";
import { Product } from "../models/index.js";
import authMiddleware from "../utils/authMiddleware.js";
import { requireSeller } from "../utils/roleMiddleware.js";
import cloudinary from '../config/cloudinary.js';

const product = Router()
product.post('/', authMiddleware, requireSeller, async (req, res) => {
    try {
        console.log(req)
        const { name, description, price, category, condition, usedCondition, images = [], status, stock } = req.body;
        const product = await Product.create({
            name, description, price,
            category, condition, images: images.map(i => ({ url: i.url, publicId: i.publicId })), status,
            stock, usedCondition, seller: req.user.id
        });
        res.status(201).json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
})

product.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, q, category, min, max } = req.query;
        const query = {};
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }
        if (category) query.category = category;
        if (min || max) {
            query.price = {};
            if (min) query.price.$gte = Number(min);
            if (max) query.price.$lte = Number(max);
        }
        const pageNum = Number(page);
        const limitNum = Math.min(Number(limit), 50);
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = await Promise.all([
            Product.find(query)
                .populate('seller', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments(query)
        ]);
        res.json({ items, page: pageNum, total, pages: Math.ceil(total / limitNum) });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

product.get('/mine/list', authMiddleware, requireSeller, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = Number(page);
        const limitNum = Math.min(Number(limit), 100);
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = await Promise.all([
            Product.find({ seller: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments({ seller: req.user.id })
        ]);
        res.json({ items, page: pageNum, total, pages: Math.ceil(total / limitNum) });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

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

product.put('/:id', authMiddleware, requireSeller, async (req, res) => {
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
        const prevPublicIds = (product.images || []).map(i => i.publicId).filter(Boolean);
        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.condition = condition ?? product.condition;
        product.usedCondition = usedCondition ?? product.usedCondition;
        if (images) {
            product.images = images.map(i => ({ url: i.url, publicId: i.publicId }));
            // Determine removed images and delete from Cloudinary asynchronously (don't block response)
            const newIds = product.images.map(i => i.publicId).filter(Boolean);
            const removed = prevPublicIds.filter(id => id && !newIds.includes(id));
            if (removed.length) {
                (async () => {
                    for (const pid of removed) {
                        try { await cloudinary.uploader.destroy(pid); } catch (e) { console.warn('Cloudinary destroy failed', pid); }
                    }
                })();
            }
        }
        product.status = status ?? product.status;
        product.stock = stock ?? product.stock;


        const updatedProduct = await product.save();
        res.json(updatedProduct);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

product.delete('/:id', authMiddleware, requireSeller, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found!' });
        }
        if (product.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized for the product!' });
        }
        const imageIds = (product.images || []).map(i => i.publicId).filter(Boolean);
        await product.deleteOne();
        if (imageIds.length) {
            (async () => {
                for (const pid of imageIds) {
                    try { await cloudinary.uploader.destroy(pid); } catch (e) { console.warn('Cloudinary delete failed', pid); }
                }
            })();
        }
        res.json({ message: 'Product removed successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

product.delete('/:id/images/:publicId', authMiddleware, requireSeller, async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id);
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        if (prod.seller.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
        const { publicId } = req.params;
        const img = prod.images.find(i => i.publicId === publicId);
        if (!img) return res.status(404).json({ message: 'Image not found' });
        prod.images = prod.images.filter(i => i.publicId !== publicId);
        await prod.save();
        if (publicId) {
            try { await cloudinary.uploader.destroy(publicId); } catch (e) { console.warn('Cloudinary delete failed', publicId); }
        }
        res.json({ message: 'Image removed', images: prod.images });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server Error' });
    }
});
export { product };