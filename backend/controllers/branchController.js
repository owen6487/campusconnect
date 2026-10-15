const mongoose = require('mongoose');
const Branch = require('../models/Branch');
const Campus = require('../models/campus');

const AddBranch = async (req, res) => {
    try {
        const { name, campusId, campus } = req.body;
        const campusRef = campusId || campus || req.params.campusId;

        if (!name || !campusRef) {
            return res.status(400).json({ message: 'Name and campusId are required' });
        }

        const existingBranch = await Branch.findOne({ name, campus: campusRef });
        if (existingBranch) {
            return res.status(400).json({ message: 'Branch already exists for this campus' });
        }

        const newBranch = new Branch({ name, campus: campusRef });
        await newBranch.save();

        res.status(201).json({ message: 'Branch added successfully', branch: newBranch });
    } catch (error) {
        console.error('Error adding branch:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const bulkAddBranches = async (req, res) => {
    try {
        const { campusId } = req.params;
        let { names } = req.body;

        if (!mongoose.Types.ObjectId.isValid(campusId)) {
            return res.status(400).json({ message: 'Invalid campus ID' });
        }
        const campus = await Campus.findById(campusId);
        if (!campus) {
            return res.status(404).json({ message: 'Campus not found' });
        }
        if (!Array.isArray(names) || !names.length) {
            return res.status(400).json({ message: 'Send an array of names' });
        }

        const cleaned = [...new Set(names.map((n) => String(n).trim()).filter(Boolean))];

        const existing = new Set(
            (await Branch.find({ campus: campusId }).select('name'))
                .map((b) => b.name.toLowerCase())
        );
        const toAdd = cleaned.filter((n) => !existing.has(n.toLowerCase()));
        const skipped = cleaned.filter((n) => existing.has(n.toLowerCase()));

        if (toAdd.length) {
            await Branch.insertMany(toAdd.map((name) => ({ name, campus: campusId })));
        }

        res.status(201).json({ added: toAdd.length, skippedCount: skipped.length, skipped });
    } catch (error) {
        console.error('Bulk add branches error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllBranches = async (req, res) => {
    try {
        const campusRef = req.params.campusId || req.query.campusId;
        const filter = campusRef ? { campus: campusRef } : {};

        const branches = await Branch.find(filter).populate('campus', 'name');
        res.status(200).json(branches);
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    AddBranch,
    getAllBranches,
    bulkAddBranches
};