import React, { useState, useEffect } from 'react';
import { formatPercentage } from '../utils/formatters';
import ChartComponent from '../components/Chart';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import OrgChart from 'react-orgchart';
import {
    getCardProcessingData,
    getTaxaIntegracaoFiltered,
    getContasCriadasFiltered,
    getCartoesEnviadosFiltered,
    getPropostasSeguroFiltered,
    getPropostasSeguroValorFiltered,
    getCasosCessaoFiltered,
} from '../lib/supabase';
import 'react-orgchart/index.css';

function CardProcessing({ filters }) {
    const [selectedKPI, setSelectedKPI] = useState(null);
    const [modalContent, setModalContent] = useState(null);
    const [workflowType, setWorkflowType] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadMockData, setLoadMockData] = useState(false);
    const [zoomScale, setZoomScale] = useState(1.2);
    const [isFullDocModalOpen, setIsFullDocModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filters, loadMockData]);

    useEffect(() => {
        console.log("zoomScale updated:", zoomScale);
    }, [zoomScale]);

    const integrationOrganogramData = {
        name: 'Julio Bugone',
        title: 'Gestor Geral',
        color: 'purple',
        children: [
            {
                name: 'Douglas Di Sisto',
                title: 'Supervisor de Operações',
                color: 'purple',
                children: [
                    { name: 'Giovanna', title: 'Equipe', color: 'purple', children: [] },
                    { name: 'Paloma', title: 'Equipe', color: 'purple', children: [] },
                    { name: 'Adriano', title: 'Equipe', color: 'purple', children: [] },
                ]
            },
        ]
    };

    const accountsOrganogramData = {
        name: 'Julio Bugone',
        title: 'Gestor Geral',
        color: 'teal',
        children: [
            {
                name: 'Douglas Di Sisto',
                title: 'Supervisor de Operações',
                color: 'teal',
                children: [
                    { name: 'Jaqueline', title: 'Equipe', color: 'teal', children: [] },
                ]
            },
        ]
    };

    const cardsOrganogramData = {
        name: 'Julio Bugone',
        title: 'Gestor Geral',
        color: 'orange',
        children: [
            {
                name: 'Gustavo',
                title: 'Supervisor de Operações',
                color: 'orange',
                children: [
                    { name: 'Arthur', title: 'Equipe', color: 'orange', children: [] },
                    { name: 'Suelen', title: 'Equipe', color: 'orange', children: [] },
                    { name: 'Pablo', title: 'Equipe', color: 'orange', children: [] },
                    { name: 'Vitória', title: 'Equipe', color: 'orange', children: [] },
                    { name: 'João', title: 'Equipe', color: 'orange', children: [] },
                    { name: 'Arlindo ', title: 'Equipe', color: 'orange', children: [] },
                    { name: 'Douglas ', title: 'Equipe', color: 'orange', children: [] },
                    { name: 'Francisco', title: 'Equipe', color: 'orange', children: [] },
                    { name: 'João V ', title: 'Equipe', color: 'orange', children: [] },
                ]
            },
        ]
    };

    const insuranceProposalsOrganogramData = {
        name: 'Julio Bugone',
        title: 'Gestor Geral',
        color: 'pink',
        children: [
            {
                name: 'Douglas Di Sisto',
                title: 'Supervisor de Operações',
                color: 'pink',
                children: [
                    { name: 'Antonio', title: 'Equipe', color: 'pink', children: [] },
                    { name: 'Cabral', title: 'Equipe', color: 'pink', children: [] },
                    { name: 'Lucrecio', title: 'Equipe', color: 'pink', children: [] },
                ]
            },
        ]
    };

    const defaultLineOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                display: true,
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
            },
            datalabels: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false
                },
                ticks: {
                    padding: 10
                }
            },
            x: {
                grid: {
                    drawBorder: false
                },
                ticks: {
                    padding: 10
                }
            }
        }
    };

    const MyNodeComponent = ({ node }) => {
        const getColorClasses = (color) => {
            const colorMap = {
                purple: 'bg-purple-50 border-purple-200 text-purple-600',
                teal: 'bg-teal-50 border-teal-200 text-teal-600',
                pink: 'bg-pink-50 border-pink-200 text-pink-600',
                orange: 'bg-orange-50 border-orange-200 text-orange-600'
            };
            return colorMap[color] || 'bg-gray-50 border-gray-200 text-gray-600';
        };

        return (
            <div className={`person-card border rounded-lg p-4 ${getColorClasses(node.color)}`}>
                <div className="person-info">
                    <i className="fas fa-user mb-2"></i>
                    <div className="person-name font-medium">{node.name}</div>
                    {node.title && <div className="person-role text-sm opacity-75">{node.title}</div>}
                </div>
            </div>
        );
    };

    const openFullDocumentModal = (e) => {
        e.stopPropagation();
        setIsFullDocModalOpen(true);
    };

    const closeFullDocumentModal = () => {
        setIsFullDocModalOpen(false);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            let responseData;

            if (filters.agreement && filters.agreement !== 'all') {
                // Se um convênio específico estiver selecionado, use as funções filtradas
                const convenioFilter = filters.agreement;

                // Busque cada KPI filtrado individualmente
                const integrationRateData = await getTaxaIntegracaoFiltered(convenioFilter);
                const accountsCreatedData = await getContasCriadasFiltered(convenioFilter);
                const cardsSentData = await getCartoesEnviadosFiltered(convenioFilter);
                const insuranceProposalsData = await getPropostasSeguroFiltered(convenioFilter);
                const valorData = await getPropostasSeguroValorFiltered(convenioFilter);
                const cessaoData = await getCasosCessaoFiltered(convenioFilter);

                // Combine os dados filtrados em um objeto de resposta similar ao getCardProcessingData
                responseData = {
                    integrationRate: integrationRateData ? integrationRateData[0] : null, // Ajuste conforme a estrutura de retorno da função filtrada
                    accountsCreated: accountsCreatedData ? accountsCreatedData[0] : null, // Ajuste conforme a estrutura de retorno
                    cardsSent: cardsSentData ? cardsSentData[0] : null, // Ajuste conforme a estrutura de retorno
                    insuranceProposals: insuranceProposalsData ? insuranceProposalsData[0] : null, // Ajuste conforme a estrutura de retorno
                    valorData: valorData ? valorData[0] : null, // Ajuste conforme a estrutura de retorno
                    cessaoData: cessaoData ? cessaoData[0] : null, // Ajuste conforme a estrutura de retorno
                    filters: data?.filters // Mantenha os filtros originais, se necessário
                };

                // **Importante:** Ajuste a forma como você acessa os dados dentro de responseData
                // com base na estrutura de retorno REAL das suas funções _filtered_by_convenio.
                // O exemplo acima assume que cada função retorna um array com um objeto, como: `[{ taxa_percentual: ..., ... }]`
                // Adapte para a estrutura real que suas funções retornam.

            } else {
                // Se 'all' ou nenhum convênio selecionado, use a função original para dados não filtrados
                responseData = await getCardProcessingData();
            }

            setData(responseData);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Carregando Dados...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-red-600">{error}</div>
                <button
                    onClick={() => setLoadMockData(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Carregar com dados fictícios
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">No data available</div>
            </div>
        );
    }

    const handleKPIClick = (kpiType, viewType = 'details') => {
        try {
            setSelectedKPI(kpiType);
            setModalContent({
                title: getModalTitle(kpiType, viewType),
                content: getModalContent(kpiType, viewType)
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

    const getModalTitle = (kpiType, viewType) => {
        const titles = {
            integration: {
                details: 'Taxa de Integração - Detalhamento',
            },
            accounts: {
                details: 'Contas Criadas e Não Criadas - Detalhamento',
            },
            cards: {
                details: 'Cartões Enviados - Detalhamento',
            },
            insuranceProposals: {
                details: 'Propostas com seguros - Detalhamento',
            }
        };
        return titles[kpiType]?.[viewType] || 'Detalhamento';
    };

    const getModalContent = (kpiType) => {
        console.log(`Data for ${kpiType} modal:`, data); // Log data at the beginning of getModalContent

        switch (kpiType) {
            case 'integration': {
                console.log("Dados de integrationRate dentro de getModalContent:", data?.integrationRate);

                const integrationRateData = data?.integrationRate;
                const digitized = integrationRateData?.propostas_digitadas_sucesso || 0;
                const notDigitized = integrationRateData?.propostas_nao_digitadas || 0;

                const digitizedStopReasons = data?.digitizedStopReasons || [];
                const nonDigitizedReasonsBreakdown = data?.nonDigitizedReasonsBreakdown || [];

                return (
                    <div className="space-y-6" style={{ maxWidth: '50vw' }}>
                        <div className="bg-white rounded-lg shadow-md" style={{ maxWidth: '35vw', margin: '0 auto' }}>
                            {console.log("Dados para ChartComponent (bar) - Integration:", digitized, notDigitized)}
                            <ChartComponent
                                type="bar"
                                data={{
                                    labels: [''],
                                    datasets: [
                                        {
                                            label: 'Digitadas',
                                            data: [digitized],
                                            backgroundColor: 'rgba(16, 185, 129, 0.7)',
                                            borderColor: 'rgb(16, 185, 129)',
                                            borderWidth: 1
                                        },
                                        {
                                            label: 'Não Digitadas',
                                            data: [notDigitized],
                                            backgroundColor: 'rgba(236, 72, 153, 0.7)',
                                            borderColor: 'rgb(236, 72, 153)',
                                            borderWidth: 1
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            display: true
                                        },
                                        tooltip: {
                                            enabled: true,
                                            mode: 'index',
                                            intersect: false,
                                            callbacks: {
                                                label: function (context) {
                                                    const value = context.raw;
                                                    return `${context.dataset.label}: ${value} `;
                                                }
                                            }
                                        },
                                        datalabels: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                drawBorder: false
                                            },
                                            ticks: {
                                                padding: 10
                                            }
                                        },
                                        x: {
                                            offset: true,
                                            categoryPercentage: 0.7,
                                            barPercentage: 0.7,
                                            grid: {
                                                drawBorder: false
                                            },
                                            ticks: {
                                                padding: 10
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>

                        <p className="text-sm text-gray-500 mt-2 text-center">
                            Passe o mouse sobre as fatias para ver o valor total exato.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                            {console.log("Dados para renderPieChartContent (digitizedStopReasons):", digitizedStopReasons)}
                            {renderPieChartContent(digitizedStopReasons, 'Digitadas')}
                            {console.log("Dados para renderPieChartContent (nonDigitizedReasonsBreakdown):", nonDigitizedReasonsBreakdown)}
                            {renderPieChartContent(nonDigitizedReasonsBreakdown, 'Não Digitação')}
                        </div>
                    </div>
                );
            }
        case 'accounts': {
    console.log("getModalContent case: accounts");
    console.log("Dados de accountsCreated dentro de getModalContent:", data?.accountsCreated);

    const accountsCreatedData = data?.accountsCreated;
    const createdReasons = data?.contasCriadasMotivos || [];
    const notCreatedReasons = data?.contasNaoCriadasMotivos || [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Contas Criadas</h3>
                    {renderPieChartContent(createdReasons, 'Contas Criadas')}
                </div>

                <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Contas Não Criadas</h3>
                    {renderPieChartContent(notCreatedReasons, 'Contas Não Criadas')}
                </div>
            </div>

            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Resumo</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Contas Criadas</p>
                        <p className="text-xl font-bold">{accountsCreatedData?.contas_criadas_sucesso || 0}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">Contas Não Criadas</p>
                        <p className="text-xl font-bold">{accountsCreatedData?.contas_nao_criadas || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

case 'cards': {
    console.log("getModalContent case: cards");
    console.log("Dados de cardsSent dentro de getModalContent:", data?.cardsSent);

    const cardsSentData = data?.cardsSent;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Resumo de Cartões</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">Total de Cartões</p>
                        <p className="text-xl font-bold">{cardsSentData?.total_contas_criadas || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Cartões Enviados</p>
                        <p className="text-xl font-bold">{cardsSentData?.cartoes_enviados || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Status dos Cartões</h3>
                <ChartComponent
                    type="bar"
                    data={{
                        labels: ['Enviados', 'Não Enviados'],
                        datasets: [{
                            label: 'Quantidade de Cartões',
                            data: [
                                cardsSentData?.cartoes_enviados || 0,
                                cardsSentData?.cartoes_nao_enviados || 0
                            ],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.7)', // Verde para enviados
                                'rgba(239, 68, 68, 0.7)'   // Vermelho para não enviados
                            ],
                            borderColor: [
                                'rgb(16, 185, 129)',
                                'rgb(239, 68, 68)'
                            ],
                            borderWidth: 1
                        }]
                    }}
                    options={{
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const value = context.raw;
                                        return `${context.label}: ${value} cartões`;
                                    }
                                }
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
        </div>
    );
}

case 'insuranceProposals': {
    console.log("getModalContent case: insuranceProposals");
    console.log("Dados de insuranceProposals dentro de getModalContent:", data?.insuranceProposals);
    console.log("Dados de valorData dentro de getModalContent:", data?.valorData);
    console.log("Dados de cessaoData dentro de getModalContent:", data?.cessaoData);

    const insuranceData = data?.insuranceProposals;
    const valorData = data?.valorData;
    const cessaoData = data?.cessaoData;

    // Prepare data for the first pie chart (Total distribution)
    const totalDistributionData = [
        { reason: 'Com Seguro', count: insuranceData?.propostas_com_seguro || 0 },
        { reason: 'Sem Seguro', count: insuranceData?.propostas_sem_seguro || 0 }
    ];

    // Prepare data for the second pie chart (Valor distribution)
    const valorDistributionData = [
        { reason: 'Maiores que 200', count: valorData?.propostas_seguro_maiores_200 || 0 },
        { reason: 'Menores que 200', count: valorData?.propostas_seguro_menores_200 || 0 }
    ];

    // Prepare data for the third pie chart (Cessão distribution)
    const cessaoDistributionData = [
        { reason: 'Casos Cedidos', count: cessaoData?.casos_cedidos || 0 },
        { reason: 'Em Processo de Cessão', count: cessaoData?.casos_em_processo_cessao || 0 }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    {renderPieChartContent(totalDistributionData, 'Distribuição Total de Propostas')}
                </div>
                <div>
                    {renderPieChartContent(valorDistributionData, 'Distribuição por Valor')}
                </div>
            </div>

            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Status de Cessão</h3>
                {renderPieChartContent(cessaoDistributionData, 'Status de Cessão')}
                <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500 italic">* Referente às propostas maiores que R$ 200</p>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Resumo</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">Total de Propostas</p>
                        <p className="text-xl font-bold">{insuranceData?.total_propostas || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Propostas com Seguro</p>
                        <p className="text-xl font-bold">{insuranceData?.propostas_com_seguro || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

            default:
                return (
                    <div className="text-center p-4">
                        <p className="text-gray-600">Dados insuficientes para exibir este conteúdo</p>
                    </div>
                );
        }
    };

    const renderPieChartContent = (chartData, title) => {
        console.log('chartData in renderPieChartContent:', chartData, 'title:', title);

        const chartBackgroundColor = [
            'rgb(59, 130, 246)',   // Azul
            'rgb(16, 185, 129)',  // Verde/Teal
            'rgb(245, 158, 11)',  // Laranja/Amarelo
            'rgb(239, 68, 68)',   // Vermelho
            'rgb(168, 85, 247)',  // Roxo
            'rgb(20, 184, 166)',  // Turquesa
            'rgb(249, 115, 22)',  // Laranja Escuro
            'rgb(236, 72, 153)'   // Rosa/Magenta
        ];
        const chartBorderColor = [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(168, 85, 247)',
            'rgb(20, 184, 166)',
            'rgb(249, 115, 22)',
            'rgb(236, 72, 153)'
        ];


        return (
            <div className="bg-white rounded-lg p-3 shadow-md">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>

                <ChartComponent
                    type="pie"
                    data={{
                        labels: chartData.map(item => item.reason),
                        datasets: [{
                            data: chartData.map(item => item.count),
                            backgroundColor: chartBackgroundColor,
                            borderColor: chartBorderColor,
                            borderWidth: 1
                        }]
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: true,
                            },
                            datalabels: {
                                display: true,
                                color: 'black',
                                font: { weight: 'normal', size: 11 }, // Further reduced font size to 10
                                position: 'outside',
                                offset: 10,          // Slightly increased offset to 10
                                padding: 4,
                                anchor: 'center',
                                align: 'end',
                                formatter: function (value, context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    let percentage = 0;
                                    if (total > 0 && typeof value === 'number') {
                                        percentage = ((value / total) * 100);
                                        if (isNaN(percentage) || !isFinite(percentage)) {
                                            return 'N/A%';
                                        }
                                        return `${percentage.toFixed(1)}%`;
                                    } else {
                                        return '0.0%';
                                    }
                                }
                            },
                        },
                    }}
                />
                <div className="custom-pie-legend grid grid-cols-2 gap-x-4 max-w-md mx-auto">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex items-center mb-2" style={{ width: '100%', minWidth: '150px' }}> {/* ADDED WIDTH AND MIN-WIDTH */}
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: chartBackgroundColor[index], borderColor: chartBorderColor[index], borderWidth: '1px', borderStyle: 'solid' }}></div>
                            {console.log('item.percentage in legend:', item.percentage, typeof item.percentage)}
                            <div className="text-xs" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}> {/* ADDED overflowWrap and wordBreak */}
                                {item.reason}:
                                {item.percentage ? ` ${Number(item.percentage).toFixed(1)}%` : ` ${formatPercentage((item.count / chartData.reduce((sum, i) => sum + i.count, 0)))}`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getWorkflowTitle = (kpiType, workflowType) => {
        const types = {
            flowchart: 'Fluxograma',
            orgchart: 'Organograma',
            docs: 'POPs'
        };
        const kpis = {
            integration: 'Operações',
            accounts: 'Criação de Contas',
            insuranceProposals: 'Seguros',
            cards: 'Envio de Cartões',
        };
        return `${types[workflowType]} - ${kpis[kpiType]}`;
    };

    const getWorkflowContent = (kpiType, workflowType, kpiColor) => { // Receive kpiColor
        const workflowContentMap = {
            integration: {
                flowchart: (
                    <div>
                        <div className="fluxograma-image-container overflow-auto relative">
                            <img
                                src="/assets/fluxograma_integracao.png"
                                alt="Fluxograma de Digitação de Propostas integradas"
                                className={`fluxograma-image zoomable`}
                                style={{ transform: `scale(${zoomScale})` }}
                            />
                        </div>
                        <p className="text-xs text-black-500 mt-2 text-center"> {/* Alterado para text-gray-500 e className correto */}
                            <span className="doc-link" onClick={openFullDocumentModal}>
                                Consulte o documento completo para detalhes.
                            </span>
                            <span className="doc-link text-blue-500 cursor-pointer" onClick={openFullDocumentModal}> {/* Adicionado text-blue-500 e cursor-pointer e className correto */}
                                AQUI
                            </span>
                        </p>
                    </div>
                ),
                orgchart: (
                    <div>
                        <div className="organograma-react-orgchart-container">
                            <OrgChart
                                tree={kpiType === 'integration' ? integrationOrganogramData : kpiType === 'accounts' ? accountsOrganogramData : kpiType === 'cards' ? cardsOrganogramData : kpiType === 'insuranceProposals' ? insuranceProposalsOrganogramData : integrationOrganogramData} // Correct tree based on kpiType
                                NodeComponent={MyNodeComponent}
                            />
                        </div>
                    </div>
                ),
                docs: (
                    <div>
                        <h4 className="font-semibold mb-2">POP - Digitação de Propostas (Placeholder)</h4>
                        <p>Leitura de PDF do POP será implementada aqui:</p>
                        <div className="pdf-placeholder-container mt-2 p-4 border rounded-md bg-gray-100">
                            <p className="text-sm text-gray-700 italic">
                                [Placeholder - Leitor de PDF será implementado aqui para exibir o documento "POP - Digitação de Propostas no Função - Passo a Passo.pdf"]
                            </p>
                            <p className="text-xs text-gray-500 mt-2">*Leitor de PDF placeholder. Integração real do PDF viewer na próxima etapa.</p>
                        </div>
                    </div>
                )
            },
            accounts: {
                flowchart: (
                    <div>
                        <div className="fluxograma-image-container overflow-auto">
                            <img
                                src="/assets/fluxograma_integracao.png"
                                alt="Fluxograma de Criação de Contas"
                                style={{ transform: `scale(${zoomScale})` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            <span className="doc-link" onClick={openFullDocumentModal}>
                                *Fluxograma exibido como imagem estática. Consulte o documento completo para detalhes.
                            </span>
                        </p>
                    </div>
                ),
                orgchart: (
                    <div>
                        <div className="organograma-react-orgchart-container">
                            <OrgChart
                                tree={kpiType === 'integration' ? integrationOrganogramData : kpiType === 'accounts' ? accountsOrganogramData : kpiType === 'cards' ? cardsOrganogramData : kpiType === 'insuranceProposals' ? insuranceProposalsOrganogramData : integrationOrganogramData} // Correct tree based on kpiType
                                NodeComponent={MyNodeComponent}
                            />
                        </div>
                    </div>
                ),
                docs: (
                    <div>
                        <h4 className="font-semibold mb-2">POP - Digitação de Propostas (Placeholder)</h4>
                        <p>Leitura de PDF do POP será implementada aqui:</p>
                        <div className="pdf-placeholder-container mt-2 p-4 border rounded-md bg-gray-100">
                            <p className="text-sm text-gray-700 italic">
                                [Placeholder - Leitor de PDF será implementado aqui para exibir o documento "POP - Digitação de Propostas no Função - Passo a Passo.pdf"]
                            </p>
                            <p className="text-xs text-gray-500 mt-2">*Leitor de PDF placeholder. Integração real do PDF viewer na próxima etapa.</p>
                        </div>
                    </div>
                )
            },
            cards: {
                flowchart: (
                    <div>
                        <div className="fluxograma-image-container overflow-auto">
                            <img
                                src="/assets/fluxograma_integracao.png"
                                alt="Fluxograma de Digitação de Seguros"
                                style={{ transform: `scale(${zoomScale})` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            <span className="doc-link" onClick={openFullDocumentModal}>
                                *Fluxograma exibido como imagem estática. Consulte o documento completo para detalhes.
                            </span>
                        </p>
                    </div>
                ),
                orgchart: (
                    <div>
                        <div className="organograma-react-orgchart-container">
                            <OrgChart
                                tree={kpiType === 'integration' ? integrationOrganogramData : kpiType === 'accounts' ? accountsOrganogramData : kpiType === 'cards' ? cardsOrganogramData : kpiType === 'insuranceProposals' ? insuranceProposalsOrganogramData : integrationOrganogramData} // Correct tree based on kpiType
                                NodeComponent={MyNodeComponent}
                            />
                        </div>
                    </div>
                ),
                docs: (
                    <div>
                        <h4 className="font-semibold mb-2">POP - Digitação de Propostas (Placeholder)</h4>
                        <p>Leitura de PDF do POP será implementada aqui:</p>
                        <div className="pdf-placeholder-container mt-2 p-4 border rounded-md bg-gray-100">
                            <p className="text-sm text-gray-700 italic">
                                [Placeholder - Leitor de PDF será implementado aqui para exibir o documento "POP - Digitação de Propostas no Função - Passo a Passo.pdf"]
                            </p>
                            <p className="text-xs text-gray-500 mt-2">*Leitor de PDF placeholder. Integração real do PDF viewer na próxima etapa.</p>
                        </div>
                    </div>
                )
            },
            insuranceProposals: {
                flowchart: (
                    <div>
                        <div className="fluxograma-image-container overflow-auto">
                            <img
                                src="/assets/Digitação Seguros.png"
                                alt="Fluxograma de Digitação de Seguros"
                                style={{ transform: `scale(${zoomScale})` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            <span className="doc-link" onClick={openFullDocumentModal}>
                                *Fluxograma exibido como imagem estática. Consulte o documento completo para detalhes.
                            </span>
                        </p>
                    </div>
                ),
                orgchart: (
                    <div>
                        <div className="organograma-react-orgchart-container">
                            <OrgChart
                                tree={kpiType === 'integration' ? integrationOrganogramData : kpiType === 'accounts' ? accountsOrganogramData : kpiType === 'cards' ? cardsOrganogramData : kpiType === 'insuranceProposals' ? insuranceProposalsOrganogramData : integrationOrganogramData} // Correct tree based on kpiType
                                NodeComponent={MyNodeComponent}
                            />
                        </div>
                    </div>
                ),
                docs: (
                    <div>
                        <h4 className="font-semibold mb-2">POP - Digitação de Propostas (Placeholder)</h4>
                        <p>Leitura de PDF do POP será implementada aqui:</p>
                        <div className="pdf-placeholder-container mt-2 p-4 border rounded-md bg-gray-100">
                            <p className="text-sm text-gray-700 italic">
                                [Placeholder - Leitor de PDF será implementado aqui para exibir o documento "POP - Digitação de Propostas no Função - Passo a Passo.pdf"]
                            </p>
                            <p className="text-xs text-gray-500 mt-2">*Leitor de PDF placeholder. Integração real do PDF viewer na próxima etapa.</p>
                        </div>
                    </div>
                )
            },
        };

        const content = workflowContentMap[kpiType]?.[workflowType] || `Conteúdo em definição para ${workflowType} de ${kpiType}.`;

        return (
            <div className="modal-workflow-content">
                {content}
            </div>
        );
    };

    console.log("Data object in CardProcessing:", data); // <--- Adicione este console.log ANTES do return
    console.log("insuranceProposals object in Data:", data?.insuranceProposals);


    return (
        <div data-name="card-processing" className="dashboard-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title="Taxa de Integração"
                    value={formatPercentage(data?.integrationRate?.taxa_percentual) || 'N/A'}
                    subtitle={`${data?.integrationRate?.propostas_digitadas_sucesso || 'undefined'} de ${data?.integrationRate?.total_propostas_digitacao || 'undefined'}`}
                    icon="fa-sync"
                    color="purple"
                    onClick={() => handleKPIClick('integration')}
                    onWorkflowClick={(type) => handleWorkflowClick('integration', type)}
                />
                <KPICard
                    title="Contas Criadas"
                    value={formatPercentage(data?.accountsCreated?.contas_criadas_percentual) || 'N/A'}
                    subtitle={`${data?.accountsCreated?.contas_criadas_sucesso || 'undefined'} de ${data?.accountsCreated?.total_propostas_digitadas || 'undefined'}`}
                    icon="fa-user-plus"
                    color="teal"
                    onClick={() => handleKPIClick('accounts')}
                    onWorkflowClick={(type) => handleWorkflowClick('accounts', type)}
                />
                <KPICard
                    title="Cartões Enviados"
                    value={formatPercentage(data?.cardsSent?.cartoes_enviados_percentual) || 'N/A'}
                    subtitle={`${data?.cardsSent?.cartoes_enviados || 'undefined'} de ${data?.cardsSent?.total_contas_criadas || 'undefined'}`}
                    icon="fa-credit-card"
                    color="orange"
                    onClick={() => handleKPIClick('cards')}
                    onWorkflowClick={(type) => handleWorkflowClick('cards', type)}
                />
                <KPICard
                    title="Propostas com Seguro"
                    value={data?.insuranceProposals?.propostas_com_seguro?.toLocaleString() || 'N/A'}
                    subtitle={`${formatPercentage(data?.insuranceProposals?.propostas_seguro_percentual) || 'N/A'} das propostas`}
                    icon="fa-file-contract"
                    color="pink"
                    onClick={() => handleKPIClick('insuranceProposals')}
                    onWorkflowClick={(type) => handleWorkflowClick('insuranceProposals', type)}
                />
            </div>
            <div className="mb-8">
                <ChartComponent
                    type="line"
                    data={{
                        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                        datasets: [{
                            label: 'Taxa de Integração',
                            data: [75, 78, 82, 80, 85, 88],
                            borderColor: 'rgb(168, 85, 247)',
                        }]
                    }}
                    options={defaultLineOptions}
                />
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
            <Modal
                isOpen={isFullDocModalOpen}
                onClose={closeFullDocumentModal}
                title="Documento Completo do Fluxograma">
                <div className="p-6 text-center">
                    <p className="text-gray-700">
                        [Em criação] - O documento completo do fluxograma será exibido aqui.
                    </p>
                </div>
            </Modal>
        </div>
    );
}

export default CardProcessing;