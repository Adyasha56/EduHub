// server/controllers/authController.js
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Helper to generate token
const generateToken = (id, role, year, branch) => {
  return jwt.sign({ id, role, year, branch }, process.env.JWT_SECRET, {
    expiresIn: '8h'
  });
};

// Check email availability
export const checkEmailAvailability = async (req, res) => {
  const { email } = req.query;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  return res.status(200).json({ available: !exists });
};

// Student Register
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, year, branch } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Password strength validation
    const passwordRules = [
      { test: password?.length >= 8,            message: 'Password must be at least 8 characters' },
      { test: /[A-Z]/.test(password),            message: 'Password must contain at least one uppercase letter' },
      { test: /[a-z]/.test(password),            message: 'Password must contain at least one lowercase letter' },
      { test: /[0-9]/.test(password),            message: 'Password must contain at least one number' },
      { test: /[^A-Za-z0-9]/.test(password),     message: 'Password must contain at least one special character' },
    ];
    const failed = passwordRules.find(r => !r.test);
    if (failed) {
      return res.status(400).json({ message: failed.message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = await User.create({ name, email, password, year, branch });
    const token = generateToken(newUser._id, 'student', newUser.year, newUser.branch);

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        year: newUser.year,
        branch: newUser.branch
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Student Login
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update login activity
    const loginEntry = {
      timestamp: new Date(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };

    // Keep only last 10 login entries
    if (user.loginHistory && user.loginHistory.length >= 10) {
      user.loginHistory = user.loginHistory.slice(-9);
    }
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push(loginEntry);
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, 'student', user.year, user.branch);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        year: user.year,
        branch: user.branch
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Admin Login (no change, admin me year/branch ki need nahi)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken(admin._id, 'admin');

    res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Admin login failed', error: err.message });
  }
};

// Student Logout
export const logoutStudent = async (req, res) => {
  try {
    // Token is managed on client side (localStorage), so we just send success response
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};

// Admin Logout
export const logoutAdmin = async (req, res) => {
  try {
    // Token is managed on client side (localStorage), so we just send success response
    res.status(200).json({ message: 'Admin logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Admin logout failed', error: err.message });
  }
};

// Forgot Password - Generate Reset Token
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token (valid for 30 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save({ validateBeforeSave: false });

    // Return reset token to frontend
    // Frontend will use this to create reset link
    res.status(200).json({
      message: 'Password reset token generated',
      resetToken,
      resetLink: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`
    });
  } catch (err) {
    res.status(500).json({ message: 'Error generating reset token', error: err.message });
  }
};

// Reset Password - Validate Token and Update Password
export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash the token to compare
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user and validate token
    const user = await User.findOne({
      email,
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({
      message: 'Password reset successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
};
