export const getLineChartConfig = (labels, datasets, chartOptions = {}) => {
    const defaultOptions = { // **1. Define default options in a separate object**
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                display: true,
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
            },
             datalabels: { // datalabels plugin for Line Chart, initially disabled by default
                display: chartOptions.displayDataLabels === true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
            },
            x: {}
        }
    };

    const options = { // **2. Merge defaultOptions with chartOptions using spread operator (chartOptions last for override)**
        ...defaultOptions,
        ...chartOptions, // chartOptions will override defaultOptions
        plugins: { // Ensure plugins are also merged correctly
            ...defaultOptions.plugins,
            ...chartOptions.plugins,
            datalabels: { // Specifically handle datalabels plugin merge if chartOptions.plugins.datalabels is present
                ...defaultOptions.plugins.datalabels,
                ...chartOptions.plugins?.datalabels
            },
            legend: { // Specifically handle legend plugin merge
                ...defaultOptions.plugins.legend,
                ...chartOptions.plugins?.legend,
                labels: { // And labels within legend
                    ...defaultOptions.plugins.legend.labels,
                    ...chartOptions.plugins?.legend?.labels
                }
            },
            tooltip: { // Specifically handle tooltip plugin merge
                ...defaultOptions.plugins.tooltip,
                ...chartOptions.plugins?.tooltip,
                callbacks: { // And callbacks within tooltip, if any
                    ...defaultOptions.plugins.tooltip.callbacks,
                    ...chartOptions.plugins?.tooltip?.callbacks
                }
            }
        },
        scales: { // Ensure scales are also merged correctly
            ...defaultOptions.scales,
            ...chartOptions.scales,
            y: { // Specifically handle y scale merge
                ...defaultOptions.scales.y,
                ...chartOptions.scales?.y,
                ticks: { // And ticks within y scale if any
                    ...defaultOptions.scales.y.ticks,
                    ...chartOptions.scales?.y?.ticks
                },
                title: { // And title within y scale if any
                    ...defaultOptions.scales.y.title,
                    ...chartOptions.scales?.y?.title
                }
            },
            x: { // Specifically handle x scale merge
                ...defaultOptions.scales.x,
                ...chartOptions.scales?.x,
                ticks: { // And ticks within x scale if any
                    ...defaultOptions.scales.x.ticks,
                    ...chartOptions.scales?.x?.ticks
                },
                title: { // And title within x scale if any
                    ...defaultOptions.scales.x.title,
                    ...chartOptions.scales?.x?.title
                }
            }
        }
    };

    return {
        data: {
            labels,
            datasets: datasets.map(dataset => ({
                label: dataset.label,
                data: dataset.data,
                borderColor: dataset.borderColor || 'rgb(59, 130, 246)',
                tension: 0.1,
                fill: false
            }))
        },
        options: options
    };
};


export const getBarChartConfig = (labels, datasets, chartOptions = {}) => {
    const defaultOptions = { // **1. Define default options in a separate object**
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                display: true,
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
            },
            datalabels: {
                display: chartOptions.displayDataLabels !== false, // datalabels enabled by default if not explicitly false
                color: 'white',
                anchor: 'end',
                align: 'top',
                offset: 4,
                font: {
                    size: 12,
                    weight: 'bold'
                },
                formatter: chartOptions.labelFormatter ? chartOptions.labelFormatter : Math.round
            }
        },
        scales: {
            y: {
                beginAtZero: true,
            },
            x: {
                offset: true,
            }
        }
    };

    const options = { // **2. Merge defaultOptions with chartOptions using spread operator (chartOptions last for override)**
        ...defaultOptions,
        ...chartOptions,
        plugins: { // Ensure plugins are also merged correctly
            ...defaultOptions.plugins,
            ...chartOptions.plugins,
            datalabels: { // Specifically handle datalabels plugin merge
                ...defaultOptions.plugins.datalabels,
                ...chartOptions.plugins?.datalabels
            },
            legend: { // Specifically handle legend plugin merge
                ...defaultOptions.plugins.legend,
                ...chartOptions.plugins?.legend,
                labels: { // And labels within legend
                    ...defaultOptions.plugins.legend.labels,
                    ...chartOptions.plugins?.legend?.labels
                }
            },
            tooltip: { // Specifically handle tooltip plugin merge
                ...defaultOptions.plugins.tooltip,
                ...chartOptions.plugins?.tooltip,
                callbacks: { // And callbacks within tooltip, if any
                    ...defaultOptions.plugins.tooltip.callbacks,
                    ...chartOptions.plugins?.tooltip?.callbacks
                }
            }
        },
        scales: { // Ensure scales are also merged correctly
            ...defaultOptions.scales,
            ...chartOptions.scales,
            y: { // Specifically handle y scale merge
                ...defaultOptions.scales.y,
                ...chartOptions.scales?.y,
                ticks: { // And ticks within y scale if any
                    ...defaultOptions.scales.y.ticks,
                    ...chartOptions.scales?.y?.ticks
                },
                title: { // And title within y scale if any
                    ...defaultOptions.scales.y.title,
                    ...chartOptions.scales?.y?.title
                }
            },
            x: { // Specifically handle x scale merge
                ...defaultOptions.scales.x,
                ...chartOptions.scales?.x,
                ticks: { // And ticks within x scale if any
                    ...defaultOptions.scales.x.ticks,
                    ...chartOptions.scales?.x?.ticks
                },
                title: { // And title within x scale if any
                    ...defaultOptions.scales.x.title,
                    ...chartOptions.scales?.x?.title
                }
            }
        }
    };

    return {
        data: {
            labels,
            datasets: datasets.map((dataset, index) => ({
                label: dataset.label,
                data: dataset.data,
                backgroundColor: dataset.backgroundColor,
                borderColor: dataset.borderColor,
                borderWidth: 1
            }))
        },
        options: options
    };
};

export const getPieChartConfig = (labels, data, chartOptions = {}) => {
    const defaultOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                align: 'center',
                display: true,
                labels: {
                    padding: 10,
                    usePointStyle: true,
                    font: {
                        size: 12
                    },
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const dataset = data.datasets[0];
                                const value = dataset.data[i];
                                const total = dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                let displayText = `${label}: ${percentage}%`;
                                if (label === 'Endereço Errado') {
                                    displayText = `Endereço Errado:${percentage}%`; // **Insert line break after "Endereço Errado:"**
                                }
                                return {
                                    text: displayText, // Use modified displayText
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.borderColor[i],
                                    lineWidth: 1,
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    },
                    box: {
                        padding: 0,
                        textAlign: 'left',
                        style: {
                            wordBreak: 'break-word',
                            lineHeight: 1.2
                        }
                    }
                }
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                display: true,
                formatter: chartOptions.labelFormatter ? chartOptions.labelFormatter : (value) => `${value}%`
            }
        },
    };

    const options = {
        ...defaultOptions,
        ...chartOptions,
        plugins: {
            ...defaultOptions.plugins,
            ...chartOptions.plugins,
            datalabels: {
                ...defaultOptions.plugins.datalabels,
                ...chartOptions.plugins?.datalabels
            },
            legend: {
                ...defaultOptions.plugins.legend,
                ...chartOptions.plugins?.legend,
                labels: {
                    ...defaultOptions.plugins.legend.labels,
                    ...chartOptions.plugins?.legend?.labels
                }
            },
            tooltip: {
                ...defaultOptions.plugins.tooltip,
                ...chartOptions.plugins?.tooltip,
                callbacks: {
                    ...defaultOptions.plugins.tooltip.callbacks,
                    ...chartOptions.plugins?.tooltip?.callbacks
                }
            }
        }
    };

    return {
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(16, 185, 129, 0.5)',
                    'rgba(245, 158, 11, 0.5)',
                    'rgba(239, 68, 68, 0.5)',
                    'rgba(168, 85, 247, 0.5)',
                    'rgba(20, 184, 166, 0.5)',
                    'rgba(249, 115, 22, 0.5)',
                    'rgba(236, 72, 153, 0.5)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(168, 85, 247)',
                    'rgb(20, 184, 166)',
                    'rgb(249, 115, 22)',
                    'rgb(236, 72, 153)'
                ],
                borderWidth: 1
            }]
        },
        options: options
    };
};
