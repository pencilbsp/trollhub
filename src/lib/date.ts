import { vi } from 'date-fns/locale';
import { type DateRange } from 'react-day-picker';
import { differenceInDays, format, formatDistanceToNow } from 'date-fns';

const getDateRange = (daysAgo = 0): DateRange => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return { from: startDate, to: endDate };
};

const formatToNow = (date: string | number | Date) => {
    const now = new Date();
    const daysDifference = differenceInDays(now, new Date(date));

    if (daysDifference < 7) {
        return formatDistanceToNow(new Date(date), {
            locale: vi,
            addSuffix: true,
            includeSeconds: true,
        });
    } else {
        return formatDate(date, 'HH:mm dd/MM/yyyy');
    }
};

const isDateRange = (date: any): date is DateRange => {
    return typeof date === 'object' && 'from' in date && 'to' in date;
};

const formatDate = (date: string | number | Date | DateRange, fstring: string = 'HH:mm dd/MM/yyyy'): string => {
    if (isDateRange(date)) {
        return `${format(date.from || new Date(), fstring, { locale: vi })} - ${format(date.to || new Date(), fstring, { locale: vi })}`;
    }

    return format(new Date(date), fstring, { locale: vi });
};

export { getDateRange, formatToNow, formatDate, isDateRange };
