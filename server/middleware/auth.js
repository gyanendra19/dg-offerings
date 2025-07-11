import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Debug logs
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers);

    // Get token from cookie
    token = req.cookies.token;
    console.log('Token:', token, !token);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorizedsss to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user to request object
      req.user = await User.findById(decoded.id);
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Not authorizeddsd to access this route'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'User role is not authorized to access this route'
      });
    }
    next();
  };
}; 