// Các hàm tính toán cho màn Tools
// Luôn viết code ngắn gọn, dễ đọc và có chú thích.

import { Expense } from '../types';

// 1) Phân bổ ngân sách tháng
// income: thu nhập tháng
// savingRate: tỉ lệ tiết kiệm (0..1). Ví dụ: 0.2 = 20%
// categories: map phần trăm phân bổ cho từng danh mục (0..1)
//  Nếu không truyền, dùng tỉ lệ mặc định.
export const allocateMonthlyBudget = (
  income: number,
  savingRate = 0.2,
  categories?: Record<string, number>
) => {
  const inc = Math.max(0, income);
  const save = Math.min(Math.max(savingRate, 0), 1);
  const remain = inc * (1 - save);

  const defaultMap: Record<string, number> = {
    'Ăn uống': 0.25,
    'Di chuyển': 0.1,
    'Nhà ở': 0.25,
    'Tiện ích': 0.1,
    'Mua sắm': 0.1,
    'Giải trí': 0.1,
    'Khác': 0.1,
  };

  const map = categories || defaultMap;
  const sum = Object.values(map).reduce((s, v) => s + v, 0) || 1;
  const norm: Record<string, number> = {};
  Object.entries(map).forEach(([k, v]) => (norm[k] = v / sum));

  const budget: Record<string, number> = {};
  Object.entries(norm).forEach(([k, v]) => (budget[k] = remain * v));

  return {
    saving: inc * save,
    spending: remain,
    byCategory: budget,
  };
};

// 2) Dự đoán số dư cuối tháng
// currentBalance: số dư hiện tại
// dailyAvgSpend: chi tiêu trung bình/ngày
// daysLeft: số ngày còn lại trong tháng
// projectedIncome: thu nhập dự kiến còn lại tháng này
export const predictEndOfMonthBalance = (
  currentBalance: number,
  dailyAvgSpend: number,
  daysLeft: number,
  projectedIncome = 0
) => {
  const cb = Number(currentBalance) || 0;
  const avg = Math.max(0, Number(dailyAvgSpend) || 0);
  const days = Math.max(0, Math.floor(daysLeft) || 0);
  const income = Math.max(0, Number(projectedIncome) || 0);
  const expectedSpending = avg * days;
  return cb + income - expectedSpending;
};

// 3) Lãi kép tiết kiệm
// principal: số tiền gốc
// annualRate: lãi suất năm (vd 0.08 = 8%)
// timesPerYear: số lần nhập lãi mỗi năm (12: hàng tháng)
// years: số năm gửi
// monthlyContribution: gửi thêm mỗi tháng (nếu có)
export const compoundInterest = (
  principal: number,
  annualRate: number,
  timesPerYear: number,
  years: number,
  monthlyContribution = 0
) => {
  const P = Math.max(0, principal);
  const r = Math.max(0, annualRate);
  const n = Math.max(1, Math.floor(timesPerYear));
  const t = Math.max(0, years);
  const m = Math.max(0, monthlyContribution);

  const base = P * Math.pow(1 + r / n, n * t);

  // Quy đổi contribution hàng tháng sang chu kỳ n
  // xấp xỉ: góp đều hàng tháng => 12 lần/năm
  const contribRate = r / 12;
  const months = Math.floor(t * 12);
  const contribFV = m * ((Math.pow(1 + contribRate, months) - 1) /
    (contribRate || 1));

  return base + contribFV;
};

// 3b) Khoản vay - tiền trả hàng tháng
// principal: tiền vay
// annualRate: lãi suất năm
// termMonths: số tháng vay
export const loanMonthlyPayment = (
  principal: number,
  annualRate: number,
  termMonths: number
) => {
  const P = Math.max(0, principal);
  const r = Math.max(0, annualRate) / 12;
  const n = Math.max(1, Math.floor(termMonths));
  if (r === 0) return P / n;
  const num = P * r * Math.pow(1 + r, n);
  const den = Math.pow(1 + r, n) - 1;
  return num / den;
};

// 4) Phân tích chi tiêu: tỉ lệ % theo danh mục
export const categoryPercentages = (expenses: Expense[]) => {
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  if (total === 0) return {} as Record<string, number>;
  const byCat = expenses.reduce<Record<string, number>>((acc, e) => {
    if (!e.category) return acc;
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});
  const pct: Record<string, number> = {};
  Object.entries(byCat).forEach(([k, v]) => (pct[k] = v / total));
  return pct;
};
