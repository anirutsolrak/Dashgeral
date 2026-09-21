import { createClient } from '@supabase/supabase-js';
import { getMockData } from '../utils/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getCardProcessingData = async () => {
    try {
        // Fetch data from OVERALL, UNFILTERED views (SECTION 1 of SQL code)
        const [
            integrationData,
            accountsMotivesData,
            accountsData,
            cardsData,
            insuranceData,
            valorData,
            cessaoData,
            motivosDigitacaoData,
            convenioViewData
        ] = await Promise.all([
            supabase
                .from('view_taxa_integracao') // UNFILTERED view
                .select('*')
                .single()
                .then(({ data, error }) => { if (error) throw error; return data; }),
            supabase
                .from('view_motivos_contas_criadas') // UNFILTERED view
                .select('*')
                .then(({ data, error }) => { if (error) throw error; return data; }),
            supabase
                .from('view_contas_criadas') // UNFILTERED view
                .select('*')
                .single()
                .then(({ data, error }) => { if (error) throw error; return data; }),
            supabase
                .from('view_cartoes_enviados') // UNFILTERED view
                .select('*')
                .single()
                .then(({ data, error }) => { if (error) throw error; return data; }),
            supabase
                .from('view_propostas_seguro') // UNFILTERED view
                .select('*')
                .single()
                .then(({ data, error }) => { if (error) throw error; return data; }),
            supabase
                .from('view_propostas_seguro_valor') // UNFILTERED view
                .select('*')
                .single()
                .then(({ data, error }) => { if (error) throw error; return data; }),
            supabase
                .from('view_casos_cessao') // UNFILTERED view
                .select('*')
                .single()
                .then(({ data, error }) => { if (error) throw error; return data; }),
            supabase
                .from('view_motivos_digitacao') // UNFILTERED view
                .select('*')
                .then(({ data, error }) => { if (error) throw error; return data; }),
            supabase
                .from('view_cases_by_convenio')
                .select('*')
                .then(({ data, error }) => { if (error) throw error; return data; })

        ]);

        // Process motivos de digitação - Directly from view_motivos_digitacao (UNFILTERED)
        const digitizedStopReasons = motivosDigitacaoData
            .filter(item => item.categoria === 'Digitadas')
            .map(item => ({
                reason: item.motivo,
                count: item.quantidade,
                percentage: item.porcentagem_categoria
            }));

        const nonDigitizedReasonsBreakdown = motivosDigitacaoData
            .filter(item => item.categoria === 'Não Digitação')
            .map(item => ({
                reason: item.motivo,
                count: item.quantidade,
                percentage: item.porcentagem_categoria
            }));


        // Process accounts motives data - Directly from view_motivos_contas_criadas (UNFILTERED)
        const contasCriadasMotivos = accountsMotivesData
            .filter(item => item.categoria === 'Contas Criadas')
            .map(item => ({
                reason: item.motivo,
                count: item.quantidade,
                percentage: item.porcentagem_categoria
            }));

        const contasNaoCriadasMotivos = accountsMotivesData
            .filter(item => item.categoria === 'Contas Não Criadas')
            .map(item => ({
                reason: item.motivo,
                count: item.quantidade,
                percentage: item.porcentagem_categoria
            }));


        // Transform convenio data for filters - ADDED SECTION - Keep as is
        const agreementCategories = { // Initialize with empty agreements - NO pre-defined categories
            all: { label: 'Todos', agreements: [] },
        };

        convenioViewData.forEach(item => {
            const agreement = {
                id: item.convenio_type.toLowerCase().replace(/ /g, '_').replace(/\./g, ''), // create id from convenio_type
                label: item.convenio_type, // Use convenio_type as label
                count: item.case_count
            };
            const convenioTypeLower = item.convenio_type.toLowerCase();
            let categoryKey = 'all'; // Default category is 'all'

            if (convenioTypeLower.startsWith('gov')) {
                categoryKey = 'governo';
            } else if (convenioTypeLower.startsWith('inss')) {
                categoryKey = 'inss';
            } else if (convenioTypeLower.startsWith('pref') || convenioTypeLower.startsWith('pm')) {
                categoryKey = 'prefeitura';
            }

            // Ensure category exists, create if not
            if (!agreementCategories[categoryKey]) {
                agreementCategories[categoryKey] = { label: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1), agreements: [] }; // Create category dynamically with capitalized label
            }

            agreementCategories[categoryKey].agreements.push(agreement); // Push to dynamic category
            agreementCategories.all.agreements.push(agreement); // Always add to 'all' category
        });


        return {
            integrationRate: integrationData || {}, // Use UNFILTERED integrationData
            accountsCreated: accountsData || {}, // Use UNFILTERED accountsData
            cardsSent: cardsData || {}, // Use UNFILTERED cardsData
            insuranceProposals: insuranceData || {}, // Use UNFILTERED insuranceData
            valorData: valorData || {}, // Use UNFILTERED valorData
            cessaoData: cessaoData || {}, // Use UNFILTERED cessaoData
            digitizedStopReasons: digitizedStopReasons, // Motivos from UNFILTERED view_motivos_digitacao
            nonDigitizedReasonsBreakdown: nonDigitizedReasonsBreakdown, // Motivos from UNFILTERED view_motivos_digitacao
            accountsMotivesData : accountsMotivesData, // Motivos from UNFILTERED view_motivos_contas_criadas
            contasCriadasMotivos: contasCriadasMotivos, // Motivos from UNFILTERED view_motivos_contas_criadas
            contasNaoCriadasMotivos: contasNaoCriadasMotivos, // Motivos from UNFILTERED view_motivos_contas_criadas
            filters: {
                agreements: convenioViewData.map(conv => ({
                    id: conv.convenio_type,
                    label: conv.convenio_type,
                    count: conv.case_count
                })),
                agreementCategories: agreementCategories // Return the DYNAMIC agreementCategories
            }
        };
    } catch (error) {
        console.error('Error fetching card processing data:', error);
        return getMockData('cardProcessing');
    }
};const fetchFilteredKPI = async (functionName, convenio) => { // **fetchFilteredKPI RECEBE 'convenio' agora**
    try {
        const { data, error } = await supabase
            .rpc(functionName, { p_convenio: convenio }); // **PASSA 'convenio' como p_convenio PARA A FUNÇÃO RPC**
        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error fetching filtered KPI ${functionName} for convenio ${convenio}:`, error);
        return null;
    }
};

const getTaxaIntegracaoFiltered = async (convenio) => { // **getTaxaIntegracaoFiltered RECEBE 'convenio'**
    return fetchFilteredKPI('calcular_taxa_integracao_filtered_by_convenio', convenio); // **PASSA 'convenio' para fetchFilteredKPI**
};

const getContasCriadasFiltered = async (convenio) => { // **getContasCriadasFiltered RECEBE 'convenio'**
    return fetchFilteredKPI('calcular_contas_criadas_filtered_by_convenio', convenio); // **PASSA 'convenio' para fetchFilteredKPI**
};

const getCartoesEnviadosFiltered = async (convenio) => { // **getCartoesEnviadosFiltered RECEBE 'convenio'**
    return fetchFilteredKPI('calcular_cartoes_enviados_filtered_by_convenio', convenio); // **PASSA 'convenio' para fetchFilteredKPI**
};

const getPropostasSeguroFiltered = async (convenio) => { // **getPropostasSeguroFiltered RECEBE 'convenio'**
    return fetchFilteredKPI('calcular_propostas_seguro_filtered_by_convenio', convenio); // **PASSA 'convenio' para fetchFilteredKPI**
};

const getPropostasSeguroValorFiltered = async (convenio) => { // **getPropostasSeguroValorFiltered RECEBE 'convenio'**
    return fetchFilteredKPI('calcular_propostas_seguro_valor_filtered_by_convenio', convenio); // **PASSA 'convenio' para fetchFilteredKPI**
};

const getCasosCessaoFiltered = async (convenio) => { // **getCasosCessaoFiltered RECEBE 'convenio'**
    return fetchFilteredKPI('calcular_casos_cessao_filtered_by_convenio', convenio); // **PASSA 'convenio' para fetchFilteredKPI**
};


export {
    supabase,
    getCardProcessingData,
    getTaxaIntegracaoFiltered,
    getContasCriadasFiltered,
    getCartoesEnviadosFiltered,
    getPropostasSeguroFiltered,
    getPropostasSeguroValorFiltered,
    getCasosCessaoFiltered,
};

export const getMockCardProcessingData = getMockData('cardProcessing');