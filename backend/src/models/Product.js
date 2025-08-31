import { Schema, model } from 'mongoose';
import { generateSku } from '../utils/sku.js';

const productSchema = new Schema({
    sku: { type: String, unique: true, immutable: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    condition: {
        type: String,
        enum: ['New', 'Refurbished', "Used"],
        required: true
    },
    usedCondition: {
        type: String,
        enum: ["Like New", "Good", "Fair"],
        required: function () {
            return this.condition === "Used";
        }
    },
    images: [{
        url: { type: String, required: true },
        publicId: { type: String }
    }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Sold', 'Removed'],
        default: 'Active'
    },
    stock: { type: Number, default: 1 },
    isAvailable: { type: Boolean, default: true },
    location: {}

}, { timestamps: true });

productSchema.methods.recalculateRating = function () {
    if (!this.reviews || !this.reviews.length) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        this.numReviews = this.reviews.length;
        this.rating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.numReviews;
    }
};

productSchema.methods.toggleLike = function (userId) {
    const idx = this.likes.findIndex(u => u.toString() === userId.toString());
    if (idx >= 0) {
        this.likes.splice(idx, 1);
    } else {
        this.likes.push(userId);
    }
    this.likesCount = this.likes.length;
    return this.likesCount;
};

productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, createdAt: -1 });

productSchema.pre("save", function (next) {
    if (this.isNew) {
        this.sku = generateSku(this._id)
    }
    next()
})

export default model('Product', productSchema);