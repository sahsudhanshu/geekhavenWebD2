import { Schema, model } from 'mongoose';

const productSchema = new Schema({
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
    isAvailable: { type: Boolean, default: true }

}, { timestamps: true });

export default model('Product', productSchema);