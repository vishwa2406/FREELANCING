const PDFDocument = require('pdfkit');

const generateCertificate = (res, { userName, courseName, completedAt }) => {
  const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=certificate-${Date.now()}.pdf`);
  doc.pipe(res);

  // Background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');

  // Border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#6366f1');

  // Title
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(42).text('CERTIFICATE OF COMPLETION', 0, 100, { align: 'center' });

  doc.fillColor('#6366f1').fontSize(18).text('Community Empowerment & Growth Portal', 0, 160, { align: 'center' });

  doc.fillColor('#94a3b8').fontSize(14).text('This certifies that', 0, 220, { align: 'center' });

  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(32).text(userName, 0, 250, { align: 'center' });

  doc.fillColor('#94a3b8').font('Helvetica').fontSize(14).text('has successfully completed the course', 0, 300, { align: 'center' });

  doc.fillColor('#6366f1').font('Helvetica-Bold').fontSize(22).text(courseName, 0, 330, { align: 'center' });

  doc.fillColor('#64748b').font('Helvetica').fontSize(12).text(`Completed on: ${new Date(completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 0, 400, { align: 'center' });

  doc.fillColor('#475569').fontSize(10).text('CEGP — Career & Skill Development Module', 0, 440, { align: 'center' });

  doc.end();
};

module.exports = generateCertificate;