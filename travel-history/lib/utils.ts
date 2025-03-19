import { parse } from 'date-fns';

export function formatDate(dateString: string): Date {
  try {
    // Try DD/MM/YYYY format first
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    // Try YYYY-MM-DD format
    const isoDate = parse(dateString, 'yyyy-MM-dd', new Date());
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // If both formats fail, return current date
    return new Date();
  } catch {
    return new Date();
  }
} 