import React, { useState, useEffect } from 'react';
import { formatPercentage, formatCurrency } from '../utils/formatters';
import { getPieChartConfig, getBarChartConfig, getLineChartConfig } from '../utils/chartConfigs';
import { getMockData } from '../utils/mockData';
import Chart from '../components/Chart';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import Table from '../components/Table';
import BrazilMapChart from '../components/BrazilMapChart';

import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function FinancialPerformance({ filters }) {
    const [selectedKPI, setSelectedKPI] = useState(null);
    const [modalContent, setModalContent] = useState(null);
    const [workflowType, setWorkflowType] = useState(null);
    const data = getMockData('financial');
    const cardUnlockDataByRegion = data.cardUnlockRateByRegion;

    const handleKPIClick = (kpiType) => {
        try {
            setSelectedKPI(kpiType);
            setModalContent({
                title: getModalTitle(kpiType),
                content: getModalContent(kpiType)
            });
        } catch (error) {
            console.error('Error handling KPI click:', error);
        }
    };

    const handleWorkflowClick = (kpiType, workflowType) => {
        setWorkflowType(workflowType);
        setSelectedKPI(kpiType);
        setModalContent({
            title: getWorkflowTitle(kpiType, workflowType),
            content: getWorkflowContent(kpiType, workflowType)
        });
    };

    const getModalTitle = (kpiType) => {
        switch (kpiType) {
            case 'usage': return 'Detalhamento - Utilização do Limite';
            case 'logistics': return 'Detalhamento - Custos Logísticos';
            case 'distribution': return 'Detalhamento - Distribuição de Utilização';
            case 'average': return 'Detalhamento - Média de Uso por Cliente';
            default: return '';
        }
    };

    const getWorkflowTitle = (kpiType, workflowType) => {
        const types = {
            flowchart: 'Fluxograma',
            orgchart: 'Organograma',
            docs: 'POPs e Vídeos'
        };
        const kpis = {
            usage: 'Utilização do Limite',
            logistics: 'Custos Logísticos',
            distribution: 'Distribuição',
            average: 'Média de Uso'
        };
        return `${types[workflowType]} - ${kpis[kpiType]}`;
    };

    const getWorkflowContent = (kpiType, workflowType) => {
        return (
            <div className="text-center p-4">
                <p className="text-gray-600">
                    Conteúdo do {workflowType} para {kpiType}
                </p>
            </div>
        );
    };

    const getModalContent = (kpiType) => {
        switch (kpiType) {
            case 'usage':
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Distribuição do Limite de Crédito</h3>
                        <Chart
                            type="pie"
                            data={getPieChartConfig(
                                ['Limite Utilizado (R$)', 'Limite Disponível (R$)'],
                                [
                                    data.limitUsage.usedAmount,
                                    data.limitUsage.totalAmount - data.limitUsage.usedAmount
                                ],
                                {
                                    labelFormatter: (value) => formatCurrency(value)
                                }
                            ).data}
                            options={getPieChartConfig([], [], {
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const value = context.raw;
                                                return `${context.label}: ${formatCurrency(value)}`;
                                            }
                                        }
                                    },
                                    datalabels: {
                                        color: 'black',
                                        font: { weight: 'normal' }
                                    }
                                }
                            }).options}
                        />
                    </div>
                );
            case 'logistics':
                const totalCostPerCard = data.logisticsCost.cardCost +
                    data.logisticsCost.envelopeCost +
                    data.logisticsCost.letterCost +
                    data.logisticsCost.shippingCost;

                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Composição do Custo Total por Cartão</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Custo do Cartão</p>
                                    <p className="text-lg font-semibold">{formatCurrency(data.logisticsCost.cardCost)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Custo do Envelope</p>
                                    <p className="text-lg font-semibold">{formatCurrency(data.logisticsCost.envelopeCost)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Custo da Carta Berço</p>
                                    <p className="text-lg font-semibold">{formatCurrency(data.logisticsCost.letterCost)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Custo Logístico</p>
                                    <p className="text-lg font-semibold">{formatCurrency(data.logisticsCost.shippingCost)}</p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-600">Custo Total por Cartão</p>
                                <p className="text-xl font-bold">{formatCurrency(totalCostPerCard)}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Custos por Status</h3>
                            <Table
                                columns={[
                                    { key: 'status', label: 'Status' },
                                    {
                                        key: 'amount',
                                        label: 'Valor Total',
                                        render: (value) => formatCurrency(value)
                                    },
                                    {
                                        key: 'costPerCard',
                                        label: 'Custo por Cartão',
                                        render: (value) => formatCurrency(value)
                                    },
                                    {
                                        key: 'availablePerCard',
                                        label: 'Disponível por Cartão',
                                        render: (value) => formatCurrency(value)
                                    },
                                    {
                                        key: 'percentage',
                                        label: 'Percentual',
                                        render: (_, row) => formatPercentage((row.amount / data.logisticsCost.totalAmount) * 100)
                                    }
                                ]}
                                data={data.logisticsCost.byStatus}
                            />
                        </div>
                    </div>
                );
            case 'distribution':
                return (
                    <div>
                        <Chart
                            type="bar"
                            data={getBarChartConfig(
                                data.distribution.map(d => d.range),
                                [{
                                    label: 'Clientes',
                                    data: data.distribution.map(d => d.count)
                                }],
                                {
                                    labelFormatter: (value) => `${value} clientes`
                                }
                            ).data}
                            options={getBarChartConfig([], []).options}
                        />
                    </div>
                );
            case 'average':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Média de Uso por Cliente por Faixa</h3>
                            <Chart
                                type="bar"
                                data={getBarChartConfig(
                                    data.limitUsage.averageByRange.map(r => r.range),
                                    [{
                                        label: 'Média de Uso',
                                        data: data.limitUsage.averageByRange.map(r => r.average)
                                    }],
                                    {
                                        labelFormatter: (value) => formatCurrency(value)
                                    }
                                ).data}
                                options={getBarChartConfig([], []).options}
                            />
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Média de Uso Disponível por Cliente por Faixa</h3>
                            <Chart
                                type="bar"
                                data={getBarChartConfig(
                                    data.limitUsage.averageByRange.map(r => r.range),
                                    [{
                                        label: 'Média Disponível',
                                        data: data.limitUsage.averageByRange.map(r => r.averageAvailable)
                                    }],
                                    {
                                        labelFormatter: (value) => formatCurrency(value)
                                    }
                                ).data}
                                options={getBarChartConfig([], []).options}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div data-name="financial-performance">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title="Taxa de Utilização"
                    value={formatPercentage(data.limitUsage.percentage)}
                    subtitle={formatCurrency(data.limitUsage.usedAmount)}
                    icon="fa-chart-pie"
                    color="emerald"
                    onClick={() => handleKPIClick('usage')}
                    onWorkflowClick={(type) => handleWorkflowClick('usage', type)}
                />
                <KPICard
                    title="Valor Total Utilizado"
                    value={formatCurrency(data.limitUsage.usedAmount)}
                    subtitle={`${data.distribution[3].count} clientes acima de 75%`}
                    icon="fa-money-bill-wave"
                    color="purple"
                    onClick={() => handleKPIClick('distribution')}
                    onWorkflowClick={(type) => handleWorkflowClick('distribution', type)}
                />
                <KPICard
                    title="Média de Uso"
                    value={formatCurrency(data.limitUsage.averageUsage)}
                    subtitle="Por cliente"
                    icon="fa-calculator"
                    color="orange"
                    onClick={() => handleKPIClick('average')}
                    onWorkflowClick={(type) => handleWorkflowClick('average', type)}
                />
                <KPICard
                    title="Custos Logísticos"
                    value={formatCurrency(data.logisticsCost.totalAmount)}
                    subtitle={`${formatCurrency(data.logisticsCost.cardCost + data.logisticsCost.envelopeCost + data.logisticsCost.letterCost + data.logisticsCost.shippingCost)} por cartão`}
                    icon="fa-truck"
                    color="rose"
                    onClick={() => handleKPIClick('logistics')}
                    onWorkflowClick={(type) => handleWorkflowClick('logistics', type)}
                />
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Taxa de Desbloqueio de Cartões por Região</h3>
                <BrazilMapChart unlockData={cardUnlockDataByRegion} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h3 className="text-lg font-semibold mb-4">Comparativo Desbloqueios vs. Bloqueios por Região</h3>
                <Chart
                    type="bar"
                    data={getBarChartConfig(
                        cardUnlockDataByRegion.map(item => item.region),
                        [
                            {
                                label: 'Desbloqueados',
                                data: cardUnlockDataByRegion.map(item => item.unlocked),
                                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                                borderColor: 'rgb(16, 185, 129)',
                                borderWidth: 1
                            },
                            {
                                label: 'Bloqueados',
                                data: cardUnlockDataByRegion.map(item => item.locked),
                                backgroundColor: 'rgba(236, 72, 153, 0.7)',
                                borderColor: 'rgb(236, 72, 153)',
                                borderWidth: 1
                            }
                        ]
                    ).data}
                    options={{
                        ...getBarChartConfig([], []).options,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const datasetLabel = context.dataset.label;
                                        const value = context.raw;
                                        const regionData = cardUnlockDataByRegion[context.dataIndex];
                                        const total = regionData.unlocked + regionData.locked;
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${datasetLabel}: ${value} (${percentage}%)`;
                                    }
                                }
                            },
                            legend: {
                                position: 'bottom'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Quantidade de Cartões'
                                }
                            }
                                                }
                    }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Distribuição da Utilização do Limite</h3>
                    <Chart
                        type="bar"
                        data={getBarChartConfig(
                            data.distribution.map(d => `${d.range} (${d.count} clientes)`),
                            [{
                                label: 'Percentual de Clientes',
                                data: data.distribution.map(d => d.percentage)
                            }],
                            {
                                labelFormatter: (value) => `${value}%`
                            }
                        ).data}
                        options={getBarChartConfig([], []).options}
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Evolução da Utilização Média (em R$ mil)</h3>
                    <Chart
                        type="line"
                        data={getLineChartConfig(
                            ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                            [{
                                label: 'Média de Utilização',
                                data: [2.1, 2.3, 2.5, 2.4, 2.6, 2.8],
                                borderColor: 'rgb(168, 85, 247)',
                            }]
                        ).data}
                        options={getLineChartConfig([], []).options}
                    />
                </div>
            </div>

            <Modal
                isOpen={!!selectedKPI}
                onClose={() => {
                    setSelectedKPI(null);
                    setWorkflowType(null);
                }}
                title={modalContent?.title || ''}
            >
                {modalContent?.content}
            </Modal>
        </div>
    );
}

export default FinancialPerformance;