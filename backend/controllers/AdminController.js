// Save as controllers/adminController.js
const mongoose = require("mongoose");
const user = require("../models/users");
const Product = require("../models/product");

const DAY = 24 * 60 * 60 * 1000;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// page/limit from the query string, with a hard cap so nobody can ask for 100000 rows
const paging = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

const getStats = async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * DAY);
    const live = { deletedAt: null }; // deleted accounts don't count

    const [totalUsers, activeUsers, inactiveUsers, newUsers, totalListings, newListings] =
      await Promise.all([
        user.countDocuments(live),
        user.countDocuments({ ...live, isActive: true }),
        user.countDocuments({ ...live, isActive: false }),
        user.countDocuments({ ...live, createdAt: { $gte: since } }),
        Product.countDocuments(),
        Product.countDocuments({ createdAt: { $gte: since } }),
      ]);

    res.status(200).json({ totalUsers, activeUsers, inactiveUsers, newUsers, totalListings, newListings });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const listUsers = async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const status = String(req.query.status ?? "all");
    const { page, limit, skip } = paging(req.query);

    const filter = { deletedAt: null };
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    if (q) {
      const rx = { $regex: escapeRegex(q), $options: "i" };
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const [users, total] = await Promise.all([
      user
        .find(filter)
        .select("name email phoneNumber role isActive isVerified authProvider createdAt campus")
        .populate("campus", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      user.countDocuments(filter),
    ]);

    res.status(200).json({ users, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    console.error("Admin list users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Body: { isActive: true | false }
const setUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be true or false" });
    }
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: "You can't change your own status" });
    }

    const target = await user.findById(userId);
    if (!target || target.deletedAt) {
      return res.status(404).json({ message: "User not found" });
    }
    if (target.role === "admin") {
      return res.status(403).json({ message: "Admin accounts can't be changed here" });
    }

    target.isActive = isActive;
    await target.save();

    console.log(`[admin] ${req.user.email} ${isActive ? "reactivated" : "deactivated"} ${target.email}`);
    res.status(200).json({
      message: isActive ? "Account reactivated" : "Account deactivated",
      user: { _id: target._id, isActive: target.isActive },
    });
  } catch (err) {
    console.error("Admin set status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const listListings = async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const { page, limit, skip } = paging(req.query);

    const filter = {};
    if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };

    const [listings, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sellerId", "name email")
        .populate("campus", "name"),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({ listings, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    console.error("Admin list listings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Listing not found" });
    }
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Listing not found" });
    }

    console.log(`[admin] ${req.user.email} deleted listing ${id} ("${deleted.name}")`);
    res.status(200).json({ message: "Listing deleted" });
  } catch (err) {
    console.error("Admin delete listing error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStats, listUsers, setUserStatus, listListings, deleteListing };