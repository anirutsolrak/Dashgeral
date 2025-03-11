import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import '../styles/ChartComponent.css'; // Import CSS file

Chart.register(ChartDataLabels);

function ChartComponent({
    type,
    data,
    options,
    height = '300px',
    containerClassName = "" // Prop for extra classes on the container div
}) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        try {
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                chartRef.current = new Chart(ctx, {
                    type,
                    data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            datalabels: {
                                display: false
                            },
                            ...options?.plugins // Use optional chaining to safely access plugins
                        },
                        ...options // Spread options last to allow overrides
                    }
                });
            }

            return () => {
                if (chartRef.current) {
                    chartRef.current.destroy();
                }
            };
        } catch (error) {
            console.error('Error creating chart:', error);
        }
    }, [data, type, options]);

    return (
        <div
            data-name="chart-container"
            className={`chart-component rounded-lg shadow-md ${containerClassName}`} // Base class + prop for extra classes
            style={{ height }} // Keep inline style for dynamic height
        >
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}

export default ChartComponent;