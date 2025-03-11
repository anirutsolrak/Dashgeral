import React from 'react';
import { formatPercentage } from '../utils/formatters';
import { getLineChartConfig, getPieChartConfig } from '../utils/chartConfigs';
import { getMockData } from '../utils/mockData';
import Chart from '../components/Chart';
import KPICard from '../components/KPICard';
import Table from '../components/Table';

function Logistics({ filters }) {
    const data = getMockData('logistics');

    return (
        <div data-name="bottleneck-analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title="Entregues"
                    value={formatPercentage(data.notDigitized.percentage)}
                    subtitle={`${data.notDigitized.total} propostas`}
                    icon="fa-check"
                    color="amber"
                />
                <KPICard
                    title="Em Trânsito"
                    value={formatPercentage(data.accountsNotCreated.percentage)}
                    subtitle={`${data.accountsNotCreated.total} contas`}
                    icon="fa-truck"
                    color="orange"
                />
                <KPICard
                    title="Custódia"
                    value={formatPercentage(data.cardsNotDelivered.percentage)}
                    subtitle={`${data.cardsNotDelivered.total} cartões`}
                    icon="fa-archive"
                    color="rose"
                />
                <KPICard
                    title="Em Processo de Devolução"
                    value={formatPercentage(data.supportIssues.percentage)}
                    subtitle={`${data.supportIssues.total} chamados`}
                    icon="fa-retweet"
                    color="purple"
                />
            </div>

            <Chart
                type="line"
                data={getLineChartConfig(
                    data.evolution.map(item => item.month),
                    [{
                        label: 'Evolução de Gargalos',
                        data: data.evolution.map(item => item.logistics)
                    }]
                ).data}
                options={{
                    ...getLineChartConfig([], []).options,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    return `${context.dataset.label}: ${value} gargalos`;
                                }
                            }
                        }
                    }
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <Chart
                    type="pie"
                    data={getPieChartConfig(
                        ['Propostas', 'Contas', 'Cartões', 'SAC'],
                        [
                            data.notDigitized.total,
                            data.accountsNotCreated.total,
                            data.cardsNotDelivered.total,
                            data.supportIssues.total
                        ]
                    ).data}
                    options={{
                        ...getPieChartConfig([], []).options,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const value = context.raw;
                                        const total = [
                                            data.notDigitized.total,
                                            data.accountsNotCreated.total,
                                            data.cardsNotDelivered.total,
                                            data.supportIssues.total
                                        ].reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${context.label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        },
                        legend: {
                            position: 'right',
                            labels: {
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map((label, i) => {
                                            const dataset = data.datasets[0];
                                            const value = dataset.data[i];
                                            const total = dataset.data.reduce((acc, val) => acc + val, 0);
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            return {
                                                text: `${label}: ${label} - ${percentage}%`, // Adjusted label format
                                                fillStyle: dataset.backgroundColor[i],
                                                strokeStyle: dataset.borderColor[i],
                                                lineWidth: 1,
                                                hidden: false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        }
                    }}
                />

                <Table
                    columns={[
                        { key: 'type', label: 'Tipo de Gargalo' },
                        { key: 'count', label: 'Quantidade' },
                        {
                            key: 'percentage', label: 'Porcentagem',
                            render: (value) => formatPercentage(value)
                        }
                    ]}
                    data={[
                        {
                            type: 'Propostas Não Digitadas',
                            count: data.notDigitized.total,
                            percentage: data.notDigitized.percentage
                        },
                        {
                            type: 'Contas Não Criadas',
                            count: data.accountsNotCreated.total,
                            percentage: data.accountsNotCreated.percentage,
                            details: data.accountsNotCreated.reasons
                        },
                        {
                            type: 'Cartões Não Entregues',
                            count: data.cardsNotDelivered.total,
                            percentage: data.cardsNotDelivered.percentage
                        },
                        {
                            type: 'Problemas SAC',
                            count: data.supportIssues.total,
                            percentage: data.supportIssues.percentage
                        }
                    ]}
                />
            </div>
        </div>
    );
}

export default Logistics;