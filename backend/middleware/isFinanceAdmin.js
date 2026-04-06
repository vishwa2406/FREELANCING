module.exports = (req, res, next) => {
  if (req.user && (req.user.role === 'finance_admin' || req.user.role === 'admin')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Finance admin access denied.'
  });
};
