const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const financeHelpers = require('./utils/financeHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/cegp').then(async () => {
    const sum = (arr) => arr.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const month = '2026-04';
    const { start, end } = financeHelpers.monthBounds(month);

    const transactions = await Transaction.find({ date: { $gte: start, $lt: end } }).sort({ date: -1 });
    console.log('Transactions length:', transactions.length);

    const income = sum(transactions.filter((t) => t.type === 'income'));
    const expense = sum(transactions.filter((t) => t.type === 'expense'));
    
    console.log('Income:', income, 'Expense:', expense);
    process.exit(0);
});
