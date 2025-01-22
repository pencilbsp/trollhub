import { type DateRange } from 'react-day-picker';

const getDateRange = (daysAgo = 0): DateRange => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return { from: startDate, to: endDate };
};

export { getDateRange };
