const mongoose = require('mongoose');
const Product = require('../models/product');
const Branchvalidation = require('../utils/validatebranch');

const createProduct = async (req, res) => {
    try {
        console.log('BODY:', req.body);
        console.log('FILES:', req.files);
        const { name, description, whatsAppLink, price, category, campus, branch, phoneNumber } = req.body;
        const sellerId = req.user?._id;

        if (!sellerId) {
            return res.status(401).json({ message: 'You must be logged in to create a listing' });
        }

        const uploadedImages = Array.isArray(req.body.images)
        ? req.body.images
       : req.body.images
       ? [req.body.images]
        : [];

      const fileImages = Array.isArray(req.files)
     ? req.files.map((file) => file.path || file.secure_url)
     : req.files && (req.files.image || req.files.images)
      ? (req.files.image || req.files.images).map((file) => file.path || file.secure_url)
      : [];

     const finalImages = uploadedImages.length > 0 ? uploadedImages : fileImages;
        if (!sellerId || !name || !description || !whatsAppLink || !price || !category || !campus || !phoneNumber) {
            return res.status(400).json({ message: 'All required fields are required' });
        }
        if (finalImages.length < 4) {
            return res.status(400).json({ message: 'At least 4 images are required' });
        }

        if (branch && branch !== 'null' && branch !== '') {
            const branchValidationResult = await Branchvalidation(branch, campus);
            if (!branchValidationResult.isValid) {
                return res.status(400).json({ message: branchValidationResult.message });
            }
        }

        const newProduct = new Product({
            sellerId,
            name,
            description,
            whatsAppLink,
            price,
            category,
            campus,
            branch: branch && branch !== 'null' && branch !== '' ? branch : null,
            phoneNumber,
            images: finalImages,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
 
const ALWAYS_EDITABLE = ["price", "description", "phoneNumber"];
const EDITABLE_IN_WINDOW = ["name"];
const NEVER_EDITABLE = ["images", "category", "campus", "branch", "sellerId"];
 
// "0712 345 678", "+254712345678", "712345678" -> "0712345678"; null when invalid
const normalizeKenyanPhone = (input = "") => {
  const d = String(input).replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(d)) return d;
  if (/^254[17]\d{8}$/.test(d)) return "0" + d.slice(3);
  if (/^[17]\d{8}$/.test(d)) return "0" + d;
  return null;
};
 
// Each cleaner returns { value } or { error }
const clean = {
  name: (v) => {
    if (typeof v !== "string") return { error: "Invalid title" };
    const t = v.trim().replace(/\s+/g, " ");
    if (t.length < 3 || t.length > 100) return { error: "Title must be 3 to 100 characters" };
    return { value: t };
  },
  price: (v) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0 || n > 100000000) return { error: "Enter a valid price" };
    return { value: n };
  },
  description: (v) => {
    if (typeof v !== "string") return { error: "Invalid description" };
    const t = v.trim();
    if (t.length < 1 || t.length > 2000) return { error: "Description must be 1 to 2000 characters" };
    return { value: t };
  },
  phoneNumber: (v) => {
    const phone = normalizeKenyanPhone(v);
    if (!phone) return { error: "Enter a valid Kenyan phone number" };
    return { value: phone };
  },
};
 
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }
 
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
 
    const postedAt = product.createdAt ? product.createdAt.getTime() : 0;
    const inWindow = Date.now() - postedAt < EDIT_WINDOW_MS;
 
    // Say so clearly when someone tries to change a locked field, instead of ignoring it silently
    const locked = [...NEVER_EDITABLE, ...(inWindow ? [] : EDITABLE_IN_WINDOW)];
    const blocked = locked.filter((k) => req.body[k] !== undefined);
    if (blocked.length) {
      const message = blocked.every((k) => k === "name")
        ? "The title can only be changed in the first 24 hours after posting."
        : "Photos, category and campus can't be changed after posting. To change them, delete this listing and post a new one.";
      return res.status(400).json({ message });
    }
 
    const allowed = [...ALWAYS_EDITABLE, ...(inWindow ? EDITABLE_IN_WINDOW : [])];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] === undefined) continue;
      const result = clean[key](req.body[key]);
      if (result.error) return res.status(400).json({ message: result.error });
      updates[key] = result.value;
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }
 
    // The WhatsApp link is always built here from the phone number.
    // It is never taken from the browser, so nobody can store a malicious link.
    if (updates.phoneNumber) {
      updates.whatsAppLink = `https://wa.me/254${updates.phoneNumber.slice(1)}`;
    }
 
    Object.assign(product, updates);
    await product.save();
    await product.populate([
      { path: "sellerId", select: "name profilePicture campus branch" },
      { path: "campus", select: "name" },
      { path: "branch", select: "name" },
    ]);
 
    res.status(200).json(product);
  } catch (error) {
    if (error.name === "ValidationError") {
      const first = Object.values(error.errors)[0];
      return res.status(400).json({ message: first?.message || "Invalid data" });
    }
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllproducts = async (req, res) => {
    try {
        const { campus, branch, category, minPrice, maxPrice, sort='newest',query , page = 1, limit = 10 } = req.query;
        const filter = {};

        if (campus) filter.campus = campus;
        if (branch) filter.branch = branch;
        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
          if (query && query.trim()) {
            // escape regex characters so "c++" or "(new)" don't break the search
            const safe = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { name: { $regex: safe, $options: 'i' } },
                { description: { $regex: safe, $options: 'i' } },
            ];
        }

        const sortOptions = {
               newest:   { createdAt: -1 },
               oldest:{ createdAt: 1 },
               'price-asc':  { price: 1 },
              'price-desc': { price: -1 },
        };

        const pageNum = Math.max(Number(page) || 1, 1);
        const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);
 

        const products = await Product.find(filter)
            .sort(sortOptions[sort] || sortOptions.newest)
            .skip((pageNum - 1) * limitNum)
            .limit(Number(limit))
            .populate('sellerId', 'name profilePicture campus branch')
            .populate('campus', 'name')
            .populate('branch', 'name');

        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getProductById = async (req, res) => {
    try{
        const product = await Product.findById(req.params.id)
        .populate('sellerId', 'name profilePicture campus branch')
        .populate('campus', 'name')
        .populate('branch', 'name');
        if(!product){
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    }
    catch(error){
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getCategories = async (req, res) => {
    try {
        const { campus } = req.query;
        const match = {};
 
        if (campus) {
            if (!mongoose.Types.ObjectId.isValid(campus)) {
                return res.status(400).json({ message: 'Invalid campus id' });
            }
            match.campus = new mongoose.Types.ObjectId(campus);
        }
 
        const cats = await Product.aggregate([
            { $match: match },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
        ]);
 
        res.status(200).json(cats.map((c) => ({ name: c._id, count: c.count })));
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getmyproducts = async (req, res) => {
    try {
        if(!req.user){
            return res.status(401).json({ message: 'Unauthorized access' });
        }
        const products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

       if (existingProduct.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        await Product.findByIdAndDelete(productId);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    createProduct,
    updateProduct,
    getAllproducts,
    getmyproducts,
    deleteProduct,
    getCategories,
    getProductById
  
};
