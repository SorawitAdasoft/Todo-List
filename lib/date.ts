export type SupportedLocale = 'th' | 'en';

/**
 * Format a date string for display
 */
export function formatDate(
  dateStr: string,
  locale: SupportedLocale = 'en'
): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
}

/**
 * Format a date string relative to now (e.g., "2 hours ago")
 */
export function formatRelativeDate(
  dateStr: string,
  locale: SupportedLocale = 'en'
): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (locale === 'th') {
      if (diffInDays > 0) return `${diffInDays} วันที่แล้ว`;
      if (diffInHours > 0) return `${diffInHours} ชั่วโมงที่แล้ว`;
      if (diffInMinutes > 0) return `${diffInMinutes} นาทีที่แล้ว`;
      return 'เมื่อสักครู่';
    } else {
      if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      return 'just now';
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return dateStr;
  }
}

/**
 * Format a due date with contextual information
 */
export function formatDueDate(
  dateStr: string,
  locale: SupportedLocale = 'en'
): {
  formatted: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  status: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none';
} {
  if (!dateStr) {
    return {
      formatted: '',
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      status: 'none',
    };
  }

  try {
    const date = new Date(dateStr);
    const now = new Date();
    
    const isOverdue = date < now && !isDateToday(dateStr);
    const isDateToday = isDateToday(dateStr);
    const isDateTomorrow = isDateTomorrow(dateStr);

    let formatted: string;
    let status: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none';

    if (isOverdue) {
      formatted = locale === 'th' ? 'เกินกำหนด' : 'Overdue';
      status = 'overdue';
    } else if (isDateToday) {
      formatted = locale === 'th' ? 'วันนี้' : 'Today';
      status = 'today';
    } else if (isDateTomorrow) {
      formatted = locale === 'th' ? 'พรุ่งนี้' : 'Tomorrow';
      status = 'tomorrow';
    } else {
      formatted = date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      status = 'upcoming';
    }

    return {
      formatted,
      isOverdue,
      isToday: isDateToday,
      isTomorrow: isDateTomorrow,
      status,
    };
  } catch (error) {
    console.error('Error formatting due date:', error);
    return {
      formatted: dateStr,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      status: 'none',
    };
  }
}

/**
 * Get the start of today in ISO format
 */
export function getStartOfToday(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

/**
 * Get the end of today in ISO format
 */
export function getEndOfToday(): string {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today.toISOString();
}

/**
 * Check if a date string is in the past
 */
export function isDatePast(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    return date < now;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date string is today
 */
export function isDateToday(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date string is tomorrow
 */
export function isDateTomorrow(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  } catch (error) {
    return false;
  }
}

/**
 * Create a date string for input[type="date"]
 */
export function toDateInputValue(date: Date | string = new Date()): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error creating date input value:', error);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Parse a date input value to ISO string
 */
export function fromDateInputValue(value: string): string {
  try {
    const date = new Date(value + 'T00:00:00.000Z');
    return date.toISOString();
  } catch (error) {
    console.error('Error parsing date input value:', error);
    return new Date().toISOString();
  }
}