const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    campus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campus',
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
}, { timestamps: true });

BranchSchema.index({ campus: 1, name: 1 }, { unique: true });

const Branch = mongoose.model('Branch', BranchSchema);

module.exports = Branch;