const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

const isMentor = (req, res, next) => {
  if (req.user && (req.user.role === 'mentor' || req.user.role === 'admin')) return next();
  return res.status(403).json({ success: false, message: 'Mentor access required' });
};

module.exports = { isAdmin, isMentor };