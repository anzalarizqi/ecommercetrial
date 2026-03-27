const jwt = require('jsonwebtoken');

/**
 * requireAuth — verifikasi JWT dari header Authorization: Bearer <token>
 * Jika valid, set req.admin = decoded payload, lalu next()
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }
};

module.exports = requireAuth;
