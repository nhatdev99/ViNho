import type { Expense } from './storage';

const CSV_HEADER = 'id,amount,category,note,date,createdAt';

export const expensesToCSV = (expenses: Expense[]): string => {
  const rows = expenses.map((e) => [
    escapeCsv(e.id),
    String(e.amount || 0),
    escapeCsv(e.category || ''),
    escapeCsv(e.note || ''),
    escapeCsv(e.date || ''),
    escapeCsv(e.createdAt || ''),
  ].join(','));
  return [CSV_HEADER, ...rows].join('\n');
};

export const csvToExpenses = (csv: string): Omit<Expense, 'id' | 'createdAt'>[] => {
  if (!csv) return [];
  const lines = csv.trim().split(/\r?\n/);
  const [header, ...data] = lines;
  const hasHeader = header.replace(/\s/g, '')
    .toLowerCase() === CSV_HEADER.replace(/\s/g, '').toLowerCase();
  const rows = hasHeader ? data : lines;
  return rows
    .map((line) => safeSplitCsv(line))
    .filter((cols) => cols.length >= 4)
    .map((cols) => {
      const [id, amount, category, note, date] = cols;
      return {
        amount: Number(amount) || 0,
        category: category || 'Khác',
        note: note || '',
        date: date || new Date().toISOString(),
      } as Omit<Expense, 'id' | 'createdAt'>;
    });
};

function escapeCsv(value: string): string {
  if (value == null) return '';
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function safeSplitCsv(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; continue; }
      if (ch === '"') { inQuotes = false; continue; }
      cur += ch;
    } else {
      if (ch === '"') { inQuotes = true; continue; }
      if (ch === ',') { result.push(cur); cur = ''; continue; }
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}


