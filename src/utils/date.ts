const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getMonthName = (month: number, short = false): string => {
  const arr = short ? MONTHS_SHORT : MONTHS;
  return arr[month - 1] || '';
};

export const getDayName = (date: Date): string => {
  return DAYS[date.getDay()];
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];
  return `${day} ${month}`;
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

export const formatDateTime = (dateStr: string): string => {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) {return 'Good Morning';}
  if (hour < 17) {return 'Good Afternoon';}
  return 'Good Evening';
};

export const getCurrentMonth = (): number => new Date().getMonth() + 1;
export const getCurrentYear = (): number => new Date().getFullYear();

export const getDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isToday = (dateStr: string): boolean => {
  const today = getDateString();
  return dateStr.startsWith(today);
};

export const getRelativeDay = (dateStr: string): string => {
  const today = new Date();
  const date = new Date(dateStr);
  const todayStr = getDateString(today);
  const dateOnly = dateStr.substring(0, 10);

  if (dateOnly === todayStr) {return 'Today';}

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateOnly === getDateString(yesterday)) {return 'Yesterday';}

  return formatDate(dateStr);
};
