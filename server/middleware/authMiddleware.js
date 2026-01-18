const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'dev_jwt_secret';

function getTokenFromReq(req) {
  const auth = req.headers.authorization || req.query.token || req.body.token;
  if (!auth) return null;
  return auth.startsWith('Bearer ') ? auth.slice(7) : auth;
}

function getUserFromReq(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (err) {
    return null;
  }
}

function verifyToken(req, res, next) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (!user.is_admin) return res.status(403).json({ success: false, message: 'Admin access required' });
  req.user = user;
  next();
}

function requireOwnerOrAdmin(req, res, next) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const userId = req.body.userId || req.body.user_id || req.query.userId || req.query.user_id;
  if (user.is_admin) {
    req.user = user;
    return next();
  }
  if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
  if (String(user.id) !== String(userId)) return res.status(403).json({ success: false, message: 'Not allowed' });
  req.user = user;
  next();
}

module.exports = { getUserFromReq, verifyToken, requireAdmin, requireOwnerOrAdmin };
