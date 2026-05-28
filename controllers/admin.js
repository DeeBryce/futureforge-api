const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // Find admin in database
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign(
    { id: admin._id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    message: 'Login successful',
    token,
  });
};

module.exports = { loginAdmin };