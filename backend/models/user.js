const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  password: String,
  otp: String,
  isVerified: { type: Boolean, default: false },
});
module.exports = mongoose.model('User', userSchema);