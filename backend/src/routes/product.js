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
        let { cursor, limit = 10, q, category, min, max } = req.query;
        const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50); // clamp 1..50

        const query = {};
        if (q) {
            const regex = { $regex: q, $options: 'i' };
            query.$or = [{ name: regex }, { description: regex }];
        }
        if (category) query.category = category;
        if (min || max) {
            query.price = {};
            if (min) query.price.$gte = Number(min);
            if (max) query.price.$lte = Number(max);
        }
        if (cursor) {
            const date = new Date(cursor);
            if (isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid cursor' });
            query.createdAt = { $lt: date }; // fetch items created before the cursor
        }

        // Fetch one extra to know if there is a next page
        const docs = await Product.find(query)
            .populate('seller', 'name email')
            .sort({ createdAt: -1, _id: -1 })
            .limit(lim + 1);

        let nextCursor = null;
        let items = docs;
        if (docs.length > lim) {
            const lastReturned = docs[lim - 1];
            nextCursor = lastReturned.createdAt.toISOString();
            items = docs.slice(0, lim);
        }

        res.json({ items, nextCursor });
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

product.get('/mine', authMiddleware, requireSeller, async (req, res) => {
    try {
        let { cursor, limit = 10 } = req.query;
        const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
        const query = { seller: req.user.id };
        if (cursor) {
            const date = new Date(cursor);
            if (isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid cursor' });
            query.createdAt = { $lt: date };
        }
        const docs = await Product.find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(lim + 1);
        let nextCursor = null;
        let items = docs;
        if (docs.length > lim) {
            const last = docs[lim - 1];
            nextCursor = last.createdAt.toISOString();
            items = docs.slice(0, lim);
        }
        res.json({ items, nextCursor });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

product.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email')
            .populate('reviews.user', 'name')
            .populate('likes', 'name')

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

// Add or update a review for a product
product.post('/:id/reviews', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || !comment) return res.status(400).json({ message: 'Rating and comment required' });
        const prod = await Product.findById(req.params.id).populate('reviews.user', 'name');
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        const existing = prod.reviews.find(r => r.user.toString() === req.user.id);
        if (existing) {
            existing.rating = rating;
            existing.comment = comment;
            existing.createdAt = new Date();
        } else {
            prod.reviews.push({ user: req.user.id, name: req.user.name || 'User', rating, comment });
        }
        prod.recalculateRating();
        await prod.save();
        await prod.populate('reviews.user', 'name');
        res.status(201).json({ reviews: prod.reviews, rating: prod.rating, numReviews: prod.numReviews });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get reviews only (lighter payload)
product.get('/:id/reviews', async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id).select('reviews rating numReviews').populate('reviews.user', 'name');
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        res.json({ reviews: prod.reviews, rating: prod.rating, numReviews: prod.numReviews });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete a review (review owner or admin)
product.delete('/:id/reviews/:reviewId', authMiddleware, async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        const prod = await Product.findById(id).populate('reviews.user', 'name');
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        const review = prod.reviews.id(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        const isOwner = review.user.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(401).json({ message: 'Not authorized' });
        review.deleteOne();
        prod.recalculateRating();
        await prod.save();
        res.json({ reviews: prod.reviews, rating: prod.rating, numReviews: prod.numReviews });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Toggle like
product.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id);
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        prod.toggleLike(req.user.id);
        await prod.save();
        res.json({ likesCount: prod.likesCount, liked: prod.likes.some(u => u.toString() === req.user.id) });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get likes summary
product.get('/:id/likes', async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id).select('likesCount likes');
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        res.json({ likesCount: prod.likesCount, likes: prod.likes });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});
export { product };