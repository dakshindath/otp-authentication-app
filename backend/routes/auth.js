const express = require('express');
const router = express.Router();
const User = require('../models/user');
const sendOtpEmail = require('../utils/otp');
const bcrypt = require('bcryptjs');

router.post('/signup', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const existingUser = await User.findOne({ email });
    
    if (existingUser && (!username || username === 'resend')) {
      existingUser.otp = otp;
      await existingUser.save();
      
      await sendOtpEmail(email, otp);
      return res.json({ message: 'OTP resent successfully' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { email },
      { username, email, phone, password: hashedPassword, otp, isVerified: false },
      { upsert: true, new: true }
    );

    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create account. Please try again.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (user && user.otp === otp) {
    user.isVerified = true;
    user.otp = null;
    await user.save();
    return res.json({ message: 'Email verified successfully' });
  }
  res.status(400).json({ message: 'Invalid OTP' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.isVerified) return res.status(400).json({ message: 'Email not verified' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  res.json({ message: 'Login successful' });
});

module.exports = router;