// Định dạng ngày tháng
const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('T')[0].split('-');
  const monthNames = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ];
  const monthName = monthNames[parseInt(month, 10) - 1];
  return `Ngày ${parseInt(day, 10)} tháng ${monthName} năm ${year}`;
};

// Lấy danh sách các ngày trong tuần
const getWeekDays = (date = new Date()): string[] => {
  const currentDay = date.getDay();
  const currentDate = date.getDate();
  const result = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(date);
    day.setDate(currentDate - currentDay + i);
    result.push(day.toISOString().split('T')[0]);
  }
  
  return result;
};

// Lấy danh sách các ngày trong tháng
const getMonthDays = (date = new Date()): string[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
};

// Lấy danh sách các tháng trong năm
const getYearMonths = (date = new Date()): string[] => {
  const year = date.getFullYear();
  return Array.from({ length: 12 }, (_, i) => 
    `${year}-${String(i + 1).padStart(2, '0')}-01`
  );
};

// Lấy tên ngày trong tuần
const getDayName = (date: Date): string => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[date.getDay()];
};

export {
  formatDate,
  getWeekDays,
  getMonthDays,
  getYearMonths,
  getDayName
};