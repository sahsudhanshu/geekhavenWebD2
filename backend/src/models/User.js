import mongoose, { Schema, model } from "mongoose";
import { genSalt, hash, compare } from "bcryptjs";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String, required: true, match: /.+\@.+\..+/,
            unique: true, lowercase: true, trim: true
        },
        password: { type: String, required: true },
        contactNumber: { type: String },
        addresses: [{
            name: { type: String, required: true },
            mobileNumber: { type: String, required: true },
            address_line_1: { type: String, required: true },
            address_line_2: String,
            pincode: { type: Number, required: true },
            state: { type: String, required: true },
            district: { type: String, required: true }
        }],
            role: {
                type: String,
                enum: ['user', 'seller', 'admin'],
                default: 'user'
            },
        likedProducts: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            require: true
        }],
        bookmarkedProducts: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            require: true
        }]
    },
    { timestamps: true }
);
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
});
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await compare(enteredPassword, this.password);
};

export default model("User", userSchema);
