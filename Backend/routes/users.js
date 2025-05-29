import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, displayName });
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    res.json({ 
      msg: "Login successful", 
      email: user.email, 
      displayName: user.displayName 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update account
router.patch("/update", async (req, res) => {
  const { currentEmail, newEmail, currentPassword, newPassword, newDisplayName } = req.body;

  try {
    const user = await User.findOne({ email: currentEmail });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Incorrect password" });

    // Prevent email collision
    if (newEmail && newEmail !== currentEmail) {
      const emailTaken = await User.findOne({ email: newEmail });
      if (emailTaken) {
        return res.status(400).json({ msg: "New email is already in use" });
      }
      user.email = newEmail;
    }

    // Update password if provided
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update display name if provided
    if (newDisplayName) {
      user.displayName = newDisplayName;
    }

    await user.save();
    res.json({ msg: "Account updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;