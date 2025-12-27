import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sv5t-secret-key-change-in-production';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'sv5t-admin-secret-change-in-production';

// Verify JWT token
export const verifyToken = (token, isAdmin = false) => {
  try {
    const secret = isAdmin ? ADMIN_SECRET : JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Middleware to verify authentication
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Middleware to authorize by role
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware for ADMIN only
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Middleware for STUDENT only
export const studentOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({
      success: false,
      error: 'Student access required'
    });
  }
  next();
};
