export const getMockData = (type) => {
    const data = {
        cardProcessing: {
            integrationRate: {
                percentage: 80,
                digitized: 800,
                notDigitized: 200,
                total: 1000,
                notDigitizedReasons: [
                    { reason: 'Documentação Incompleta', count: 100 },
                    { reason: 'Dados Inválidos', count: 60 },
                    { reason: 'Erro de Sistema', count: 40 }
                ],
                digitizedStopReasons: [ // New data for digitized stop reasons
                    { reason: 'Margem Negativa', count: 120 },
                    { reason: 'Em criação de conta', count: 50 },
                    { reason: 'Endereço Errado', count: 50 },
                    { reason: 'INSS LOAS', count: 30 },
                    { reason: 'Não Autorizada Emissão', count: 50 }
                ],
                nonDigitizedReasonsBreakdown: [ // New data for non-digitized breakdown
                    { reason: 'Saque Realizado', count: 150 },
                    { reason: 'Liquidado', count: 50 }
                ]
            },
            accountsCreated: {
                percentage: 92.5,
                total: 9250,
                reasons: [
                    { reason: 'Endereço Errado', count: 150 },
                    { reason: 'LOAS-SEGURO', count: 50 },
                    { reason: 'Proposta Duplicada', count: 30 }
                ],
                createdAccountReasons: [ // New data for "Contas Criadas" pie chart
                    { reason: 'Margem Negativa', count: 3000 },
                    { reason: 'Embossing', count: 4000 },
                    { reason: 'LOAS-SEGUROS', count: 2250 }
                ],
                nonCreatedAccountReasons: [ // New data for "Contas Não Criadas" pie chart
                    { reason: 'LOAS', count: 200 },
                    { reason: 'Endereço Errado', count: 300 },
                    { reason: 'PROPOSTAS DUPLICADAS', count: 150 },
                ]
            },
            cardsSent: {
                percentage: 92.86,
                delivered: 650,
                total: 700,
                status: [
                    { status: 'Entregue', count: 650 },
                    { status: 'Em Trânsito', count: 30 },
                    { status: 'Devolvido', count: 20 }
                ]
            },
            support: {
                total: 150,
                types: [
                    { type: 'Bloqueio e Cancelamento Indevido do Cartão', count: 45 },
                    { type: 'Onde está meu cartão', count: 35 },
                    { type: 'Problemas com Faturas e Extratos', count: 30 },
                    { type: 'Segurança e Fraudes', count: 25 },
                    { type: 'Solicitação de 2° via', count: 15 }
                ]
            },
            insuranceProposals: {
                totalProposals: 450,
                // **Dados para o Gráfico 1: Distribuição < e > 200**
                proposalValueDistribution: [
                    { reason: 'Menores que 200', count: 280 }, // Propostas com seguro < 200
                    { reason: 'Maiores que 200', count: 170 }  // Propostas com seguro > 200
                ],
                // **Dados para o Gráfico 2: Distribuição Cedidas vs. Em Cessão (para > 200)**
                proposalsGreaterThan200Distribution: [
                    { reason: 'Cedidas', count: 120 },          // Propostas > 200 cedidas
                    { reason: 'Em Processo de Cessão', count: 50 } // Propostas > 200 em processo de cessão
                ]
            }
        },
        financial: {
            limitUsage: {
                percentage: 65,
                usedAmount: 650000,
                totalAmount: 1000000,
                averageUsage: 2500,
                averageByRange: [
                    { range: '0-25%', average: 1200, averageAvailable: 800 },
                    { range: '26-50%', average: 2300, averageAvailable: 1500 },
                    { range: '51-75%', average: 3100, averageAvailable: 2000 },
                    { range: '76-100%', average: 3800, averageAvailable: 2500 }
                ]
            },
            logisticsCost: {
                totalAmount: 50000,
                cardCost: 15,
                envelopeCost: 8,
                letterCost: 5,
                shippingCost: 12,
                byStatus: [
                    {
                        status: 'Entregue',
                        amount: 25000,
                        count: 500,
                        costPerCard: 40,
                        availablePerCard: 35
                    },
                    {
                        status: 'Em Trânsito',
                        amount: 15000,
                        count: 300,
                        costPerCard: 38,
                        availablePerCard: 32
                    },
                    {
                        status: 'Custódia',
                        amount: 5000,
                        count: 100,
                        costPerCard: 35,
                        availablePerCard: 30
                    },
                    {
                        status: 'Em Devolução',
                        amount: 3000,
                        count: 60,
                        costPerCard: 42,
                        availablePerCard: 28
                    },
                    {
                        status: 'Devolvido',
                        amount: 2000,
                        count: 40,
                        costPerCard: 45,
                        availablePerCard: 25
                    }
                ]
            },
            distribution: [
                { range: '0-25%', count: 200, percentage: 20 },
                { range: '26-50%', count: 300, percentage: 30 },
                { range: '51-75%', count: 400, percentage: 40 },
                { range: '76-100%', count: 100, percentage: 10 }
            ],
            cardUnlockRateByRegion: [
                { region: 'Norte', unlocked: 1500, locked: 300, geoCode: 'N' },
                { region: 'Nordeste', unlocked: 2500, locked: 700, geoCode: 'NE' },
                { region: 'Sudeste', unlocked: 5500, locked: 1000, geoCode: 'SE' },
                { region: 'Sul', unlocked: 3000, locked: 400, geoCode: 'S' },
                { region: 'Centro-Oeste', unlocked: 2000, locked: 500, geoCode: 'CO' },
            ]
        },
        inventory: {
            cards: {
                total: 1000,
                available: 800,
                inTransit: 150,
                lost: 50
            },
            envelopes: {
                total: 1200,
                available: 900,
                inTransit: 250,
                lost: 50
            },
            letters: {
                total: 1200,
                available: 900,
                inTransit: 250,
                lost: 50
            }
        },
        logistics: {
            notDigitized: {
                percentage: 20,
                total: 200
            },
            accountsNotCreated: {
                percentage: 6.25,
                total: 50,
                reasons: [
                    { reason: 'Erro de Operação', count: 30 },
                    { reason: 'Erro Sistêmico', count: 20 }
                ]
            },
            cardsNotDelivered: {
                percentage: 7.14,
                total: 50
            },
            supportIssues: {
                percentage: 15,
                total: 150
            },
            evolution: [
                { month: 'Jan', logistics: 120 },
                { month: 'Fev', logistics: 100 },
                { month: 'Mar', logistics: 80 },
                { month: 'Abr', logistics: 90 },
                { month: 'Mai', logistics: 70 },
                { month: 'Jun', logistics: 60 }
            ]
        }
    };

    return data[type] || {};
};