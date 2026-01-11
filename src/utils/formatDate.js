import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
    if (!date) return '-';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr, { locale: id });
};

export const formatDateTime = (date) => {
    return formatDate(date, 'dd MMM yyyy HH:mm');
};

export const formatDateShort = (date) => {
    return formatDate(date, 'd MMM');
};

export const formatDateInput = (date) => {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'yyyy-MM-dd');
};
