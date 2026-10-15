const user = require("../models/users");
const Campus = require("../models/campus");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const crypto=require("crypto")
const sendEmail = require("../utils/sendemaill");
const { OAuth2Client } = require("google-auth-library");
const validateBranch = require("../utils/validatebranch");
dotenv.config();

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateEmail = (email) => {
  return validator.isEmail(email);
};
const normalizeEmail = (email) => {
  return validator.normalizeEmail(email);
};
const trimmedName = (name) => {
  return name.trim();
};
const trimmedCampus = (campus) => {
  return campus.trim();
};
const trimmedEmail = (email) => {
  return email.trim();
};

const signup = async (req, res) => {
    const { name, email, campus, branch, password } = req.body;
    const cleanName = trimmedName(name || "");
    const cleanEmail = trimmedEmail(email || "");

    if (!cleanName || !cleanEmail || !campus || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (!validateEmail(cleanEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    if (!validatePassword(password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character" });
    }
    if (!mongoose.Types.ObjectId.isValid(campus)) {
        return res.status(400).json({ message: "Invalid campus ID" });
    }

    try {
        const campusExists = await Campus.findById(campus);
        if (!campusExists) {
            return res.status(400).json({ message: "Campus does not exist" });
        }

        if (branch) {
            if (!mongoose.Types.ObjectId.isValid(branch)) {
                return res.status(400).json({ message: "Invalid branch ID" });
            }

            const branchValidation = await validateBranch(branch, campus);
            if (!branchValidation.isValid) {
                return res.status(400).json({ message: branchValidation.message });
            }
        }

        const existingUser = await user.findOne({ email: normalizeEmail(cleanEmail) });
        if (existingUser) {
            return res.status(400).json({ message: "User Account already exists please login" });
        }

        const newUser = new user({
            name: cleanName,
            email: normalizeEmail(cleanEmail),
            campus,
            password,
            branch: branch || null,
        });

        await newUser.save();

        const token = jwt.sign(
            {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        console.error("Error during user registration", err.message);
        res.status(500).json({ message: "Server error" });
    }
};
const login = async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = trimmedEmail(email || "");

    if (!cleanEmail || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const existingUser = await user
            .findOne({ email: normalizeEmail(cleanEmail) })
            .select("+password +loginAttempts +lockUntil");

        if (!existingUser || !existingUser.isActive) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
            return res.status(403).json({ message: "Account locked. Try again later." });
        }

        const isMatch = await existingUser.comparePassword(password);
        if (!isMatch) {
            await existingUser.incrementLoginAttempts();
            return res.status(400).json({ message: "Invalid credentials" });
        }

        await existingUser.resetLoginAttempts();

        const token = jwt.sign(
            {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000,
        });

        return res.status(200).json({
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                campus: existingUser.campus,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
const me = async (req, res) => {
    res.status(200).json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            campus: req.user.campus,
        },
    });
};

const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({message:"Logged out successfully"});
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const cleanEmail = trimmedEmail(email);
    if (!cleanEmail) {
        return res.status(400).json({ message: "Email is required" });
    }
    try{
        const normalizedEmailValue = normalizeEmail(cleanEmail);
        const existingUser = await user.findOne({ email: normalizedEmailValue });
        if(existingUser){
            const resetToken = crypto.randomBytes(32).toString('hex'); // 5-digit token
            const hashedToken = await bcrypt.hash(resetToken, 12);

            existingUser.resetPasswordToken = hashedToken;
            existingUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
            await existingUser.save();
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmailValue)}`;

            if (typeof sendEmail === 'function') {
                await sendEmail(
                    existingUser.email,
                    'Password Reset Request',
                    `Hello, you requested a password reset. Please use the following token to reset your password: ${resetToken}\n\nReset link: ${resetLink}`
                );
            }
        }
        res.status(200).json({message:"If the email exists, a reset link has been sent."});
    }
    catch(err){
        console.error("Error during password reset request", err.message);
        res.status(500).json({message:"Server error"});
    }
};

// Google OAuth sign-in/up using ID token from client
const googleAuth = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'ID token is required' });
    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();

        if (!payload || !payload.email_verified) {
            return res.status(400).json({ message: 'Google email not verified' });
        }

        const { sub: googleId, email, name, picture } = payload;

        let existingUser = await user.findOne({ email: normalizeEmail(email) });
        if (existingUser) {
            // If user exists but doesn't have googleId, attach it
            if (!existingUser.googleId) {
                existingUser.googleId = googleId;
                existingUser.authProvider = 'google';
                existingUser.profilePicture = existingUser.profilePicture || picture;
                await existingUser.save();
            }
            if(!existingUser.isActive){
                return res.status(403).json({message:"Account is deactivated"})
            }
        } else {
            existingUser = new user({
                name: trimmedName(name || ''),
                email: normalizeEmail(email),
                googleId,
                profilePicture: picture,
                authProvider: 'google',
                isVerified: true,
            });
            await existingUser.save();
        }

        const token = jwt.sign(
            { id: existingUser._id, name: existingUser.name, email: existingUser.email, role: existingUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000,
        });

        return res.status(200).json({
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                campus: existingUser.campus,
                branch: existingUser.branch,
                profilePicture: existingUser.profilePicture,
            },
        });
    } catch (err) {
        console.error('Google auth error', err.message);
        return res.status(500).json({ message: 'Google authentication failed' });
    }
};

const resetPassword = async (req, res) => {
    const { token, email,newPassword } = req.body;
    if (!token || !newPassword ||!email) {
        return res.status(400).json({ message: "Token, email, and new password are required" });
    }
    if (!validateEmail(trimmedEmail(email))) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    if (!validatePassword(newPassword)) {
        return res.status(400).json({ message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character" });
    }
    try{
        const existingUser = await user.findOne({
            email: normalizeEmail(trimmedEmail(email)),
            resetPasswordExpires: { $gt: Date.now() },
        }).select("+resetPasswordToken");

        if (!existingUser) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const plainToken = String(token);
        const isValidToken = await bcrypt.compare(plainToken, existingUser.resetPasswordToken);
        if (!isValidToken) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        existingUser.password = newPassword;
        existingUser.resetPasswordToken = undefined;
        existingUser.resetPasswordExpires = undefined;
        await existingUser.save();

        if (typeof sendEmail === 'function') {
            await sendEmail(
                existingUser.email,
                'Password Reset Successful',
                'Your password has been reset successfully.'
            );
        }
        res.status(200).json({message:"Password reset successfully"});

    }
    catch(err){
        console.error("Error during password reset", err.message);
        res.status(500).json({message:"Server error"});
    }
};
const deactivateAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        if (req.user._id.toString() === userId) {
            return res.status(400).json({ message: "You cannot deactivate your own account" });
        }
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const existingUser = await user.findById(userId);
        if (!existingUser || existingUser.deletedAt) {
            return res.status(404).json({ message: "User not found" });
        }
        if (existingUser.role === "admin") {
            return res.status(403).json({ message: "Admin accounts cannot be changed here" });
        }
        if (!existingUser.isActive) {
            return res.status(400).json({ message: "Account is already deactivated" });
        }

        existingUser.isActive = false;
        await existingUser.save();

        return res.status(200).json({
            message: "Account deactivated successfully",
            user: { _id: existingUser._id, isActive: false },
        });
    } catch (err) {
        console.error("Error during account deactivation", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

const reactivateAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const existingUser = await user.findById(userId);
        if (!existingUser || existingUser.deletedAt) {
            return res.status(404).json({ message: "User not found" });
        }
        if (existingUser.role === "admin") {
            return res.status(403).json({ message: "Admin accounts cannot be changed here" });
        }
        if (existingUser.isActive) {
            return res.status(400).json({ message: "Account is already active" });
        }

        existingUser.isActive = true;
        await existingUser.save();

        return res.status(200).json({
            message: "Account reactivated successfully",
            user: { _id: existingUser._id, isActive: true },
        });
    } catch (err) {
        console.error("Error during account reactivation", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};
const deleteAccount = async (req, res) => {
    const confirmation = typeof req.body?.confirmation === 'string' ? req.body.confirmation.trim() : "";

    if (confirmation.toUpperCase() !== "DELETE") {
        return res.status(400).json({ message: "Type DELETE to confirm account deletion." });
    }

    try {
        const existingUser = await user.findById(req.user._id).select("+password");
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // This also REMOVES the password hash, so the account can never log in again.
        await user.updateOne(
            { _id: existingUser._id },
            {
                $set: {
                    isActive: false,
                    deletedAt: new Date(),
                    name: "Deleted user",
                    email: `deleted_${existingUser._id}@deleted.campushub.local`,
                },
                $unset: {
                    password: 1,
                    googleId: 1,
                    phoneNumber: 1,
                    profilePicture: 1,
                    resetPasswordToken: 1,
                    resetPasswordExpires: 1,
                },
            }
        );
 
        // Listings carry the seller's phone number and WhatsApp link,
        // so they must go too. Otherwise buyers could still reach a deleted user.
        await Product.deleteMany({ sellerId: existingUser._id });
 
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
 
        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (err) {
        console.error("Error during account deletion", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};
const toProfile = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phoneNumber: u.phoneNumber || "",
  role: u.role,
  isVerified: u.isVerified,
  profilePicture: u.profilePicture,
  createdAt: u.createdAt,
  campus: u.campus,
  branch: u.branch,
});

const normalizeKenyanPhone = (input = "") => {
  const v = String(input).trim();
  if (!v) return "";
  const d = v.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(d)) return d;
  if (/^254[17]\d{8}$/.test(d)) return "0" + d.slice(3);
  if (/^[17]\d{8}$/.test(d)) return "0" + d;
  return null;
};
 
// ALLOWLIST: only these fields can be changed through updateProfile.
// Each cleaner returns { value } or { error }.
// To add a bio later: add it to the schema, then add a cleaner here.
const EDITABLE_FIELDS = {
  name: (value) => {
    if (typeof value !== "string") return { error: "Invalid name" };
    const v = value.trim().replace(/\s+/g, " ");
    if (v.length < 2 || v.length > 50) return { error: "Name must be 2 to 50 characters" };
    return { value: v };
  },
  phoneNumber: (value) => {
    if (typeof value !== "string") return { error: "Invalid phone number" };
    const cleaned = normalizeKenyanPhone(value);
    if (cleaned === null) return { error: "Enter a valid Kenyan phone number" };
    return { value: cleaned };
  },
  // bio: (value) => {
  //   if (typeof value !== "string") return { error: "Invalid bio" };
  //   const v = value.trim();
  //   if (v.length > 300) return { error: "Bio must be 300 characters or less" };
  //   return { value: v };
  // },
};
 
const getProfile = async (req, res) => {
  try {
    const existingUser = await user
      .findById(req.user._id)
      .populate("campus", "name")
      .populate("branch", "name");
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ existingUser: toProfile(existingUser) });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};
 
const updateProfile = async (req, res) => {
  try {
    const updates = {};

    if (req.body.campus !== undefined) {
      if (!req.body.campus || !mongoose.Types.ObjectId.isValid(req.body.campus)) {
        return res.status(400).json({ message: "Invalid campus" });
      }
      const campusExists = await Campus.findById(req.body.campus);
      if (!campusExists) {
        return res.status(400).json({ message: "Campus does not exist" });
      }
      updates.campus = req.body.campus;
    }

    if (req.body.branch !== undefined) {
      if (!req.body.branch || req.body.branch === "null" || req.body.branch === "") {
        updates.branch = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.body.branch)) {
          return res.status(400).json({ message: "Invalid branch" });
        }
        const branchValidation = await validateBranch(req.body.branch, req.body.campus || undefined);
        if (!branchValidation.isValid) {
          return res.status(400).json({ message: branchValidation.message });
        }
        updates.branch = req.body.branch;
      }
    }

    for (const [key, clean] of Object.entries(EDITABLE_FIELDS)) {
      if (req.body[key] === undefined) continue;
      const result = clean(req.body[key]);
      if (result.error) return res.status(400).json({ message: result.error });
      updates[key] = result.value;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const existingUser = await user.findById(req.user._id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    for (const [key, value] of Object.entries(updates)) {
      existingUser[key] = value === "" ? undefined : value;
    }
    await existingUser.save();
    await existingUser.populate([
      { path: "campus", select: "name" },
      { path: "branch", select: "name" },
    ]);

    res.status(200).json({
      message: "Profile updated successfully",
      existingUser: toProfile(existingUser),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "That phone number is already used by another account" });
    }
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const changePassword = async (req, res) => {
    try {
    const { currentPassword, newPassword,password } = req.body;
    const exstingUser = await user.findById(req.user._id).select("+password");
    if (!exstingUser) {
        return res.status(404).json({ message: "User not found" });
    }
    
    if (exstingUser.password) {
        if (!currentPassword) {
            return res.status(400).json({ message: "Current password is required" });
        }
    }
    if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
    }
    if (!validatePassword(newPassword)) {
        return res.status(400).json({ message: "New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character" });
    }
    const isMatch = await exstingUser.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password please enter the correct password" });
    }
    exstingUser.password = newPassword;
    await exstingUser.save();
    res.status(200).json({ message: "Password changed successfully" });
} catch (err) {
    console.error("Error changing password", err.message);
    res.status(500).json({ message: "Server error" });
}
};
const getAllUsers = async (req, res) => {
    try {
        if(req.user.role!=="admin"){
            return res.status(403).json({ message: "Access denied" });
        }
        const users = await user.find().select("-password");
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    signup,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    googleAuth,
    deactivateAccount,
    reactivateAccount,
    deleteAccount,
    getAllUsers,
    getProfile,
    me,
    updateProfile,
    changePassword,

};