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
    images: [{ type: String }],
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

productSchema.pre("save", function (next) {
    if (this.isNew) {
        this.sku = generateSku(this._id)
    }
    next()
})

export default model('Product', productSchema);