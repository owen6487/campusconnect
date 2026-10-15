const Campus = require('../models/campus');

const AddCampus = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Check if the campus already exists
        const existingCampus = await Campus.findOne({ name });
        if (existingCampus) {
            return res.status(400).json({ message: 'Campus already exists' });
        }

        // Create a new campus
        const newCampus = new Campus({ name });
        await newCampus.save();

        res.status(201).json({ message: 'Campus added successfully', campus: newCampus });
    } catch (error) {
        console.error('Error adding campus:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const bulkAddCampuses = async (req, res) => {
    try {
        let { names } = req.body;
        if (!Array.isArray(names) || !names.length) {
            return res.status(400).json({ message: 'Send an array of names' });
        }

        // trim, drop empties, dedupe within the payload itself
        const cleaned = [...new Set(names.map((n) => String(n).trim()).filter(Boolean))];
        if (!cleaned.length) {
            return res.status(400).json({ message: 'No valid names found' });
        }

        // case-insensitive duplicate check against what already exists
        const existing = new Set(
            (await Campus.find().select('name')).map((c) => c.name.toLowerCase())
        );
        const toAdd = cleaned.filter((n) => !existing.has(n.toLowerCase()));
        const skipped = cleaned.filter((n) => existing.has(n.toLowerCase()));

        if (toAdd.length) {
            await Campus.insertMany(toAdd.map((name) => ({ name })));
        }

        res.status(201).json({ added: toAdd.length, skippedCount: skipped.length, skipped });
    } catch (error) {
        console.error('Bulk add campuses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// controllers/universityController.js
const getAllcampus = async (req, res) => {
    try {
        const campuses = await Campus.find({
            $or: [
                { isActive: true },
                { isActive: { $exists: false } },
            ],
        }).sort({ name: 1 });

        res.status(200).json(campuses);
    } catch (error) {
        console.error('Error fetching campuses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    AddCampus,
    getAllcampus,
    bulkAddCampuses
    
};