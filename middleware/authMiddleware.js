const config = require('../config');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Adjust path if your models folder is elsewhere

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. EXTRA SECURITY: Verify the admin actually exists in the database
    // (Assuming your JWT payload has the user's ID saved as 'id' or '_id')
    const adminUser = await Admin.findById(decoded.id || decoded._id);
    
    if (!adminUser) {
        return res.status(403).json({ message: 'Access denied. Admin account not found.' });
    }

    // 3. Attach the verified database user to the request
    req.admin = adminUser; 
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;