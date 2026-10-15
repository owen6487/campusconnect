const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    whatsAppLink: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        enum: ["electronics", "clothing", "books", "furniture", "beauty", "sports", "toys", "housing", "services", "bikes", "others"],
        required: true,
    },
    campus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campus',
        required: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: false,
        default: null,
    },

    phoneNumber: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        validate: {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length >= 4;
            },
            message: 'Upload at least 4 images',
        },
        required: true,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
}, { timestamps: true });

productSchema.index({ location: "2dsphere" });
productSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;