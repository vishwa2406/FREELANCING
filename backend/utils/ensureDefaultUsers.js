const User = require('../models/User');

async function ensureUser({ name, email, password, role }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return existing;

  const user = await User.create({ name, email: normalizedEmail, password, role });
  if (typeof user.calcProfileCompletion === 'function') {
    user.calcProfileCompletion();
    await user.save();
  }
  return user;
}

module.exports = async function ensureDefaultUsers() {
  try {
    await ensureUser({
      name: 'Portal Admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@cegp.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123A',
      role: 'admin'
    });

    await ensureUser({
      name: 'Finance Admin',
      email: process.env.DEFAULT_FINANCE_ADMIN_EMAIL || 'financeadmin@cegp.com',
      password: process.env.DEFAULT_FINANCE_ADMIN_PASSWORD || 'Finance123',
      role: 'finance_admin'
    });

    console.log('✅ Default admin accounts ensured');
  } catch (error) {
    console.error('❌ Failed to ensure default admin users:', error.message);
  }
};
