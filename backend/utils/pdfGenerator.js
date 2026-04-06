const PDFDocument = require('pdfkit');

const money = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const sendMonthlyReportPdf = (res, payload) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${payload.month}-report.pdf"`);
  doc.pipe(res);

  doc.fontSize(22).text('Finance Monthly Report', { align: 'center' });
  doc.moveDown(0.4);
  doc.fontSize(12).text(`Month: ${payload.month}`);
  doc.text(`User: ${payload.userName}`);
  doc.moveDown();

  doc.fontSize(16).text('Summary');
  doc.fontSize(12).text(`Income: ${money(payload.summary.income)}`);
  doc.text(`Expense: ${money(payload.summary.expense)}`);
  doc.text(`Balance: ${money(payload.summary.balance)}`);
  doc.moveDown();

  doc.fontSize(16).text('Budget Overview');
  if (!payload.budgets.length) {
    doc.fontSize(12).text('No budgets available for this month.');
  } else {
    payload.budgets.forEach((b) => {
      doc.fontSize(12).text(`${b.category}: limit ${money(b.limitAmount)} | spent ${money(b.spent)} | remaining ${money(b.remaining)}`);
    });
  }
  doc.moveDown();

  doc.fontSize(16).text('Saving Goals');
  if (!payload.goals.length) {
    doc.fontSize(12).text('No saving goals added yet.');
  } else {
    payload.goals.forEach((g) => {
      doc.fontSize(12).text(`${g.title}: ${money(g.savedAmount)} / ${money(g.targetAmount)} (${Number(g.progress || 0).toFixed(0)}%)`);
    });
  }
  doc.moveDown();

  doc.fontSize(16).text('Transactions');
  if (!payload.transactions.length) {
    doc.fontSize(12).text('No transactions found for this month.');
  } else {
    payload.transactions.slice(0, 20).forEach((tx) => {
      doc.fontSize(11).text(`${new Date(tx.date).toLocaleDateString()} | ${String(tx.type).toUpperCase()} | ${tx.category} | ${money(tx.amount)} | ${tx.mode || 'Cash'}`);
    });
  }

  doc.end();
};

module.exports = { sendMonthlyReportPdf };
