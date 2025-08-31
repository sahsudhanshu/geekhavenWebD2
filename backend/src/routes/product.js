import { Router } from "express";
import { Product, User } from "../models/index.js";
import authMiddleware from "../utils/authMiddleware.js";
import { requireSeller } from "../utils/roleMiddleware.js";
import cloudinary from '../config/cloudinary.js';

const product = Router()

async function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        try {
            const token = header.split(' ')[1];
            const jwtImport = await import('jsonwebtoken');
            const decodedUserId = jwtImport.default.verify(token, process.env.JWT_SECRET).id;
            req.user = await User.findById(decodedUserId).select('-password');
        } catch (e) {
            console.log(e)
        }
    }
    next();
}
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

product.get('/', optionalAuth, async (req, res) => {
    try {
    let { cursor, limit = 10, q, category, min, max, seller } = req.query;
        const lim = Math.min(Math.max(parseInt(limit, 20) || 10, 1), 50);

        const query = {};
        if (q) {
            const regex = { $regex: q, $options: 'i' };
            query.$or = [{ name: regex }, { description: regex }];
        }
    if (category) query.category = category;
    if (seller) query.seller = seller;
        if (min || max) {
            query.price = {};
            if (min) query.price.$gte = Number(min);
            if (max) query.price.$lte = Number(max);
        }
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
            const lastReturned = docs[lim - 1];
            nextCursor = lastReturned.createdAt.toISOString();
            items = docs.slice(0, lim);
        }

        if (req.user) {
            const uid = req.user._id.toString();
            items = items.map(p => ({
                ...p.toObject(),
                liked: p.likes?.some(l => l.toString() === uid) || false,
                bookmarked: req.user.bookmarkedProducts?.some(bp => bp.toString() === p._id.toString()) || false
            }));
        }
        res.json({ items, nextCursor });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
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

product.get('/:id', optionalAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email')
            .populate('reviews.user', 'name')
            .populate('likes', 'name')

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        let obj = product.toObject();
        if (req.user) {
            const uid = req.user._id.toString();
            obj.liked = product.likes?.some(l => l.toString() === uid) || false;
            obj.bookmarked = req.user.bookmarkedProducts?.some(bp => bp.toString() === product._id.toString()) || false;
        }
        res.json(obj);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

product.get('/:id/price-history', async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id).select('priceHistory');
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        res.json({ priceHistory: prod.priceHistory || [] });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

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

product.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id);
        const user = await User.findById(req.user.id);
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        const wasLiked = prod.likes.some(u => u.toString() === req.user.id);
        prod.toggleLike(req.user.id);
        if (wasLiked) {
            // remove from user likedProducts
            user.likedProducts = user.likedProducts.filter(p => p.toString() !== prod.id.toString());
        } else {
            if (!user.likedProducts.some(p => p.toString() === prod.id.toString())) {
                user.likedProducts.push(prod.id);
            }
        }
        await prod.save();
        await user.save();
        res.json({ likesCount: prod.likesCount, liked: prod.likes.some(u => u.toString() === req.user.id) });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

product.post('/:id/bookmark', authMiddleware, async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id);
        const user = await User.findById(req.user.id);
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        const already = user.bookmarkedProducts.some(p => p.toString() === prod.id.toString());
        if (already) {
            user.bookmarkedProducts = user.bookmarkedProducts.filter(p => p.toString() !== prod.id.toString());
        } else {
            user.bookmarkedProducts.push(prod.id);
        }
        await user.save();
        res.json({ bookmarked: !already });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

product.post('/:id/promote', authMiddleware, requireSeller, async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id);
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        if (prod.seller.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
        prod.promoted = !prod.promoted;
        await prod.save();
        res.json({ promoted: prod.promoted });
    } catch (e) { res.status(500).json({ message: 'Server Error' }); }
});

export { product }