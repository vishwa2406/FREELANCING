const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

mongoose.connect('mongodb://127.0.0.1:27017/cegp').then(async () => {
  const user = await User.findOne({ email: 'omjashyap110@gmail.com' }) || await User.findOne();
  if(!user) {
    console.log('No user');
    process.exit(0);
  }
  console.log('User:', user.email);

  await Transaction.create({
    user: user._id,
    date: '2026-04-01', // Note: 1st of the month!
    type: 'income',
    category: 'Test',
    amount: 1000,
    mode: 'Cash'
  });

  const month = '2026-04';
  const [year, mm] = String(month).split('-').map(Number);
  const startLocal = new Date(year, mm - 1, 1);
  const endLocal = new Date(year, mm, 1);

  const startUTC = new Date(Date.UTC(year, mm - 1, 1));
  const endUTC = new Date(Date.UTC(year, mm, 1));

  console.log('startLocal:', startLocal.toISOString());
  console.log('startUTC:', startUTC.toISOString());

  const txsLocal = await Transaction.find({ user: user._id, date: { $gte: startLocal, $lt: endLocal } });
  const txsUTC = await Transaction.find({ user: user._id, date: { $gte: startUTC, $lt: endUTC } });

  console.log('Local search tx count:', txsLocal.length);
  console.log('UTC search tx count:', txsUTC.length);
  
  process.exit(0);
});
