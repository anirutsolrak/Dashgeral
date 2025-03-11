export const formatPercentage = (value) => {
    if (typeof value !== 'number') {
        return 'N/A'; // Retorna 'N/A' para valores não numéricos ou undefined
    }
    return value.toFixed(2) + '%';
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};