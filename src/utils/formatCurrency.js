export const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatNumber = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('id-ID').format(value);
};

export const formatCompact = (value) => {
    if (!value && value !== 0) return '-';
    if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(1)}jt`;
    }
    if (value >= 1000) {
        return `Rp ${(value / 1000).toFixed(0)}rb`;
    }
    return formatCurrency(value);
};
