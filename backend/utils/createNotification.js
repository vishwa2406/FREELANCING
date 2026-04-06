const Notification = require('../models/Notification');

const createNotification = async ({
  users,
  title,
  message,
  type = 'system',
  link = ''
}) => {
  try {
    const payload = users.map(userId => ({
      user: userId,
      title,
      message,
      type,
      link
    }));

    await Notification.insertMany(payload);
  } catch (err) {
    console.error('Notification Error:', err.message);
  }
};

module.exports = createNotification;