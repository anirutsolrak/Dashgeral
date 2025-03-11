import React, { useState } from 'react';
import { formatPercentage } from '../utils/formatters';
import { getBarChartConfig, getLineChartConfig } from '../utils/chartConfigs';
import { getMockData } from '../utils/mockData';
import Chart from '../components/Chart';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import Table from '../components/Table';

function InventoryManagement({ filters }) {
    const [selectedKPI, setSelectedKPI] = useState(null);
    const [modalContent, setModalContent] = useState(null);

    const data = getMockData('inventory');

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

    const getModalTitle = (kpiType) => {
        switch (kpiType) {
            case 'cards': return 'Detalhamento - Cartões';
            case 'envelopes': return 'Detalhamento - Envelopes';
            case 'letters': return 'Detalhamento - Cartas Berço';
            case 'losses': return 'Detalhamento - Perdas';
            default: return '';
        }
    };

    const getModalContent = (kpiType) => {
        const getStatusTable = (item) => (
            <Table>
                <Table
                    columns={[
                        { key: 'status', label: 'Status' },
                        { key: 'quantity', label: 'Quantidade' },
                        {
                            key: 'percentage', label: 'Percentual',
                            render: (value) => formatPercentage(value)
                        }
                    ]}
                    data={[
                        {
                            status: 'Disponível',
                            quantity: item.available,
                            percentage: (item.available / item.total) * 100
                        },
                        {
                            status: 'Em Trânsito',
                            quantity: item.inTransit,
                            percentage: (item.inTransit / item.total) * 100
                        },
                        {
                            status: 'Perdido/Extraviado',
                            quantity: item.lost,
                            percentage: (item.lost / item.total) * 100
                        }
                    ]}
                />
            </Table>
        );

        switch (kpiType) {
            case 'cards':
            case 'envelopes':
            case 'letters':
                return getStatusTable(data[kpiType]);
            case 'losses':
                return (
                    <div>
                        <Chart
                            type="bar"
                            data={getBarChartConfig(
                                ['Cartões', 'Envelopes', 'Cartas'],
                                [{
                                    label: 'Quantidade Perdida',
                                    data: [
                                        data.cards.lost,
                                        data.envelopes.lost,
                                        data.letters.lost
                                    ]
                                }]
                            ).data}
                            options={{
                                ...getBarChartConfig([], []).options,
                                plugins: {
                                    legend: {
                                        display: false // Hide legend for bar chart with single dataset
                                    }
                                }
                            }}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div data-name="inventory-management">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard>
                    <KPICard
                        title="Cartões"
                        value={data.cards.total.toLocaleString()}
                        subtitle={`${data.cards.available.toLocaleString()} disponíveis`}
                        icon="fa-credit-card"
                        color="emerald"
                        onClick={() => handleKPIClick('cards')}
                    />
                </KPICard>
                <KPICard>
                    <KPICard
                        title="Envelopes"
                        value={data.envelopes.total.toLocaleString()}
                        subtitle={`${data.envelopes.available.toLocaleString()} disponíveis`}
                        icon="fa-envelope"
                        color="purple"
                        onClick={() => handleKPIClick('envelopes')}
                    />
                </KPICard>
                <KPICard>
                    <KPICard
                        title="Cartas Berço"
                        value={data.letters.total.toLocaleString()}
                        subtitle={`${data.letters.available.toLocaleString()} disponíveis`}
                        icon="fa-file-lines"
                        color="teal"
                        onClick={() => handleKPIClick('letters')}
                    />
                </KPICard>
                <KPICard>
                    <KPICard
                        title="Perdas Totais"
                        value={(data.cards.lost + data.envelopes.lost + data.letters.lost).toLocaleString()}
                        subtitle="Total de itens extraviados"
                        icon="fa-triangle-exclamation"
                        color="rose"
                        onClick={() => handleKPIClick('losses')}
                    />
                </KPICard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Chart
                    type="bar"
                    data={getBarChartConfig(
                        ['Cartões', 'Envelopes', 'Cartas'],
                        [{
                            label: 'Total',
                            data: [
                                data.cards.total,
                                data.envelopes.total,
                                data.letters.total
                            ]
                        }]
                    ).data}
                    options={{
                        ...getBarChartConfig([], []).options,
                        plugins: {
                            legend: {
                                display: false // Hide legend for bar chart with single dataset
                            }
                        }
                    }}
                />

                <Chart
                    type="line"
                    data={getLineChartConfig(
                        ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                        [{
                            label: 'Perdas Mensais',
                            data: [150, 180, 160, 140, 130, 120]
                        }]
                    ).data}
                    options={getLineChartConfig([], []).options}
                />
            </div>

            <Modal
                isOpen={!!selectedKPI}
                onClose={() => setSelectedKPI(null)}
                title={modalContent?.title || ''}
            >
                {modalContent?.content}
            </Modal>
        </div>
    );
}

export default InventoryManagement;