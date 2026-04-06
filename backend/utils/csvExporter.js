const escapeCsv = (value) => {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const sendCsv = (res, filename, rows) => {
  const keys = rows.length ? Object.keys(rows[0]) : [];
  const header = keys.join(',');
  const body = rows.map((row) => keys.map((key) => escapeCsv(row[key])).join(',')).join('\n');
  const csv = [header, body].filter(Boolean).join('\n');

  res.header('Content-Type', 'text/csv');
  res.attachment(filename);
  return res.send(csv);
};

module.exports = { sendCsv };
