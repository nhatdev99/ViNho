export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  // Định nghĩa locale tương ứng với từng currency
  const localeMap: Record<string, string> = {
    'VND': 'vi-VN',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'JPY': 'ja-JP',
    'GBP': 'en-GB',
    'CNY': 'zh-CN',
    'KRW': 'ko-KR',
    'THB': 'th-TH',
  };

  const locale = localeMap[currency] || 'vi-VN';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
    }).format(amount);
  } catch (error) {
    // Fallback nếu currency không hỗ trợ
    return `${amount.toLocaleString()} ${currency}`;
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getDayOfWeek = (dateString: string): string => {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const date = new Date(dateString);
  return days[date.getDay()];
};
