const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
mongoose.connect('mongodb://127.0.0.1:27017/cegp').then(async () => {
    const txs = await Transaction.find().select('type amount date').lean();
    console.log(JSON.stringify(txs, null, 2));
    process.exit(0);
});
