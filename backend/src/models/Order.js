import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    name: String,
    line1: { type: String, required: true },
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: "IN" },
    phone: String
}, { _id: false });
const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], default: 'Pending', index: true },
    lineItems: {
        type: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // keep ref optional if product deleted
            productSnapshot: {
                productId: { type: mongoose.Schema.Types.ObjectId, required: true },
                name: { type: String, required: true },
                image: String,
                price: { type: Number, required: true }
            },
            quantity: { type: Number, required: true, min: 1 },
            unitPrice: { type: Number, required: true },
            extendedPrice: { type: Number, required: true }
        }, { _id: false }],
        default: []
    },
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema },
    paymentMethod: { provider: String, last4: String, txnId: String },
    timeline: {
        type: [{
            status: String,
            at: { type: Date, default: Date.now },
            note: String
        }, { _id: false }], default: []
    },
    placedAt: { type: Date, default: Date.now },
    deliveredAt: Date,
    cancelledAt: Date
}, { timestamps: true });

function generateOrderNumber() {
    return 'RE' + (Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1e5).toString(36).toUpperCase()).slice(0, 8);
}

orderSchema.pre('validate', function (next) {
    if (!this.orderNumber) this.orderNumber = generateOrderNumber();
    let subtotal = 0;
    this.lineItems.forEach(li => {
        if (li.unitPrice == null) li.unitPrice = li.productSnapshot?.price;
        li.extendedPrice = li.unitPrice * li.quantity;
        subtotal += li.extendedPrice;
    });
    this.subtotal = subtotal;
    const discount = this.discountTotal || 0;
    const tax = this.taxTotal || 0;
    const shipping = this.shippingFee || 0;
    const platform = this.platformFee || 0;
    this.total = Math.max(0, subtotal - discount + tax + shipping + platform);
    next();
});

orderSchema.index({ user: 1, placedAt: -1 });
orderSchema.index({ status: 1, placedAt: -1 });

export default mongoose.model("Order", orderSchema);