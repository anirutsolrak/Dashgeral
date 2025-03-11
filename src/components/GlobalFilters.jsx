import React, { useState, useEffect } from 'react';
import { getCardProcessingData } from '../lib/supabase';

function GlobalFilters({ filters, onFilterChange, activeTab }) {
    const [selectedMainAgreement, setSelectedMainAgreement] = useState('all');
    const [selectedLogisticsType, setSelectedLogisticsType] = useState('all');
    const [selectedLogisticsStatusGroup, setSelectedLogisticsStatusGroup] = useState('all');
    const [agreementCategories, setAgreementCategories] = useState({
        all: { label: 'Todos', agreements: [] },
        governo: { label: 'Governo', agreements: [] },
        inss: { label: 'INSS', agreements: [] },
        prefeitura: { label: 'Prefeitura', agreements: [] },
    });
    const [loadingAgreements, setLoadingAgreements] = useState(true);

    useEffect(() => {
        const fetchAgreementData = async () => {
            setLoadingAgreements(true);
            const data = await getCardProcessingData();
            if (data && data.filters && data.filters.agreementCategories) {
                setAgreementCategories(data.filters.agreementCategories);
            }
            setLoadingAgreements(false);
        };

        if (activeTab === 'cardProcessing') {
            fetchAgreementData();
        } else {
            setLoadingAgreements(false);
        }
    }, [activeTab]);


    const getFiltersForTab = () => {
        const commonPeriods = [
            { id: 'today', label: 'Hoje' },
            { id: 'week', label: 'Esta Semana' },
            { id: 'month', label: 'Este Mês' },
            { id: 'all', label: 'Todos' }
        ];

        const regions = [
            { id: 'all', label: 'Todas' },
            { id: 'north', label: 'Norte' },
            { id: 'south', label: 'Sul' },
            { id: 'east', label: 'Leste' },
            { id: 'west', label: 'Oeste' }
        ];


        const logisticsTypes = [ // NEW: Logistics Types Filter Options
            { id: 'all', label: 'Todos' },
            { id: 'flash', label: 'Flash' },
            { id: 'terceiros', label: 'Terceiros' },
        ];

        const logisticsSteps = { // Original logisticsSteps data structure - Define it FIRST
            custodia: {
                label: 'Custodia',
                steps: [
                    { id: 'aguardando_telemarketing', label: 'Aguardando telemarketing' },
                    { id: 'devolucao_habilitada_custodia', label: 'Devolução Habilitada' },
                    { id: 'habilitado_reenvio', label: 'Habilitado para Reenvio' },
                    { id: 'objeto_retirado_custodia', label: 'Objeto Retirado da Custodia' },
                    { id: 'devolvido_custodia', label: 'Devolvido' },
                ]
            },
            devolvido: {
                label: 'Devolvido',
                steps: [
                    { id: 'ciclo_operacional_encerrado_devolvido', label: 'Ciclo Operacional Encerrado' },
                    { id: 'comprovante_registrado_devolvido', label: 'Comprovante registrado' },
                    { id: 'devol_protocolada_ao_cliente', label: 'Devol.Protocolada - AO CLIENTE' },
                    { id: 'devolucao_conciliada', label: 'Devolução Conciliada' },
                    { id: 'devolucao_habilitada_devolvido', label: 'Devolução Habilitada' },
                    { id: 'devolucao_recebida_avulsa', label: 'Devolucao Recebida - Avulsa' },
                    { id: 'em_procedimento_retorno', label: 'Em procedimento de retorno' },
                    { id: 'correios_pi_devolvido', label: 'Correios Pi' },
                    { id: 'devolvendo_via_terceiro', label: 'Devolvendo via Terceiro' },
                    { id: 'nao_recebido_em_rastreamento_devolvido', label: 'Não recebido - em rastreamento' },
                    { id: 'redespachado_terceiro_devolvido', label: 'Redespachado por Terceiro' },
                ]
            },
            entregue: {
                label: 'Entregue',
                steps: [
                    { id: 'ciclo_operacional_encerrado_entregue', label: 'Ciclo Operacional Encerrado' },
                    { id: 'comprovante_registrado_entregue', label: 'Comprovante registrado' },
                    { id: 'entregue_pelo_terceiro', label: 'Entregue pelo Terceiro' },
                    { id: 'entrega_nao_efetuada_entregue', label: 'Entrega NAO efetuada' },
                    { id: 'entrega_registrada_via_rt', label: 'Entrega registrada via RT' },
                    { id: 'pod_fragmentado_franquia', label: 'POD Fragmentado - FRANQUIA' },
                ]
            },
            pendente: {
                label: 'Pendente',
                steps: [
                    { id: 'entrega_em_andamento_na_rua', label: 'Entrega em andamento (na rua)' },
                    { id: 'entrega_nao_efetuada_pendente', label: 'Entrega NAO efetuada' },
                    { id: 'entrega_nao_efetuada_rt_pendente', label: 'Entrega NAO efetuada(RT)' },
                    { id: 'nao_recebido_em_rastreamento_pendente', label: 'Não recebido - em rastreamento' },
                    { id: 'objeto_recebido', label: 'OBJETO Recebido' },
                    { id: 'postado_logistica_iniciada', label: 'Postado - logistica iniciada' },
                    { id: 'preparada_para_transferencia', label: 'Preparada para a transferencia' },
                    { id: 'programado_nova_tentativa', label: 'Programado Nova Tentativa' },
                    { id: 'aguardando_retirada', label: 'Aguardando Retirada' },
                    { id: 'correios_pi_pendente', label: 'Correios Pi' },
                    { id: 'envio_protocolado_terceiro', label: 'Envio protocolado p/ Terceiro' },
                    { id: 'redespachado_terceiro_pendente', label: 'Redespachado por Terceiro' },
                    { id: 'retido_para_devolucao', label: 'Retido para devolução' },
                ]
            },
            reenviado: {
                label: 'Reenviado',
                steps: [
                    { id: 'ciclo_operacional_encerrado_reenviado', label: 'Ciclo Operacional Encerrado' },
                    { id: 'habilitado_reenvio_reenviado', label: 'Habilitado para Reenvio' },
                ]
            },
            sinistrado: {
                label: 'Sinistrado',
                steps: [
                    { id: 'ciclo_operacional_encerrado_sinistrado', label: 'Ciclo Operacional Encerrado' },
                    { id: 'sinistrado_terceiro', label: 'Sinistrado pelo Terceiro' },
                ]
            }
        };


        const logisticsStepsGroups = { // NEW: Logistics Steps Groups Data - Renamed and restructured - Define it AFTER logisticsSteps
            all: { // 'all' option to show all steps from all groups initially if needed
                label: 'Todas',
                steps: Object.values(logisticsSteps).flatMap(group => group.steps) // Combine steps from all groups - NOW logisticsSteps IS DEFINED
            },
            custodia: {
                label: 'Custodia',
                steps: [
                    { id: 'aguardando_telemarketing', label: 'Aguardando telemarketing' },
                    { id: 'devolucao_habilitada_custodia', label: 'Devolução Habilitada' },
                    { id: 'habilitado_reenvio', label: 'Habilitado para Reenvio' },
                    { id: 'objeto_retirado_custodia', label: 'Objeto Retirado da Custodia' },
                    { id: 'devolvido_custodia', label: 'Devolvido' },
                ]
            },
            devolvido: {
                label: 'Devolvido',
                steps: [
                    { id: 'ciclo_operacional_encerrado_devolvido', label: 'Ciclo Operacional Encerrado' },
                    { id: 'comprovante_registrado_devolvido', label: 'Comprovante registrado' },
                    { id: 'devol_protocolada_ao_cliente', label: 'Devol.Protocolada - AO CLIENTE' },
                    { id: 'devolucao_conciliada', label: 'Devolução Conciliada' },
                    { id: 'devolucao_habilitada_devolvido', label: 'Devolução Habilitada' },
                    { id: 'devolucao_recebida_avulsa', label: 'Devolucao Recebida - Avulsa' },
                    { id: 'em_procedimento_retorno', label: 'Em procedimento de retorno' },
                    { id: 'correios_pi_devolvido', label: 'Correios Pi' },
                    { id: 'devolvendo_via_terceiro', label: 'Devolvendo via Terceiro' },
                    { id: 'nao_recebido_em_rastreamento_devolvido', label: 'Não recebido - em rastreamento' },
                    { id: 'redespachado_terceiro_devolvido', label: 'Redespachado por Terceiro' },
                ]
            },
            entregue: {
                label: 'Entregue',
                steps: [
                    { id: 'ciclo_operacional_encerrado_entregue', label: 'Ciclo Operacional Encerrado' },
                    { id: 'comprovante_registrado_entregue', label: 'Comprovante registrado' },
                    { id: 'entregue_pelo_terceiro', label: 'Entregue pelo Terceiro' },
                    { id: 'entrega_nao_efetuada_entregue', label: 'Entrega NAO efetuada' },
                    { id: 'entrega_registrada_via_rt', label: 'Entrega registrada via RT' },
                    { id: 'pod_fragmentado_franquia', label: 'POD Fragmentado - FRANQUIA' },
                ]
            },
            pendente: {
                label: 'Pendente',
                steps: [
                    { id: 'entrega_em_andamento_na_rua', label: 'Entrega em andamento (na rua)' },
                    { id: 'entrega_nao_efetuada_pendente', label: 'Entrega NAO efetuada' },
                    { id: 'entrega_nao_efetuada_rt_pendente', label: 'Entrega NAO efetuada(RT)' },
                    { id: 'nao_recebido_em_rastreamento_pendente', label: 'Não recebido - em rastreamento' },
                    { id: 'objeto_recebido', label: 'OBJETO Recebido' },
                    { id: 'postado_logistica_iniciada', label: 'Postado - logistica iniciada' },
                    { id: 'preparada_para_transferencia', label: 'Preparada para a transferencia' },
                    { id: 'programado_nova_tentativa', label: 'Programado Nova Tentativa' },
                    { id: 'aguardando_retirada', label: 'Aguardando Retirada' },
                    { id: 'correios_pi_pendente', label: 'Correios Pi' },
                    { id: 'envio_protocolado_terceiro', label: 'Envio protocolado p/ Terceiro' },
                    { id: 'redespachado_terceiro_pendente', label: 'Redespachado por Terceiro' },
                    { id: 'retido_para_devolucao', label: 'Retido para devolução' },
                ]
            },
            reenviado: {
                label: 'Reenviado',
                steps: [
                    { id: 'ciclo_operacional_encerrado_reenviado', label: 'Ciclo Operacional Encerrado' },
                    { id: 'habilitado_reenvio_reenviado', label: 'Habilitado para Reenvio' },
                ]
            },
            sinistrado: {
                label: 'Sinistrado',
                steps: [
                    { id: 'ciclo_operacional_encerrado_sinistrado', label: 'Ciclo Operacional Encerrado' },
                    { id: 'sinistrado_terceiro', label: 'Sinistrado pelo Terceiro' },
                ]
            }
        };


        const tabFilters = {
            cardProcessing: {
                periods: commonPeriods,
                agreementCategories: loadingAgreements ? { // Show a loading state if agreements are loading
                    all: { label: 'Carregando...', agreements: [] },
                    governo: { label: 'Carregando...', agreements: [] },
                    inss: { label: 'Carregando...', agreements: [] },
                    prefeitura: { label: 'Carregando...', agreements: [] },
                } : agreementCategories // Use fetched agreementCategories here
            },
            financial: {
                periods: commonPeriods,
                agreementCategories: loadingAgreements ? {
                    all: { label: 'Carregando...', agreements: [] },
                    governo: { label: 'Carregando...', agreements: [] },
                    inss: { label: 'Carregando...', agreements: [] },
                    prefeitura: { label: 'Prefeitura', agreements: [] },
                } : agreementCategories // share same loading state and data for other tabs if needed
            },
            inventory: {
                periods: commonPeriods
            },
            logistics: { // NEW: Logistics Tab Filters (previously bottlenecks)
                periods: commonPeriods,
                regions,
                logisticsTypes,
                logisticsStepsGroups, // Use logisticsStepsGroups here
            },
        };

        return tabFilters[activeTab] || { periods: commonPeriods };
    };


    const currentFilters = getFiltersForTab();
    const currentAgreementCategories = currentFilters.agreementCategories || {};
    const currentLogisticsSteps = currentFilters.logisticsStepsGroups || {};

    const handleMainAgreementChange = (value) => {
        setSelectedMainAgreement(value);
        onFilterChange({ agreementCategory: value, agreement: 'all' }); // **Pass agreementCategory to onFilterChange**
    };

    const handleLogisticsTypeChange = (value) => { // NEW: Handler for Logistics Type Filter
        setSelectedLogisticsType(value);
        onFilterChange({ logisticsType: value, logisticsStep: 'all', logisticsStatusGroup: 'all' }); // Reset logisticsStep and logisticsStatusGroup
        setSelectedLogisticsStatusGroup('all'); // Reset Status Group selection
    };

    const handleLogisticsStatusGroupChange = (value) => { // NEW: Handler for Logistics Status Group Filter
        setSelectedLogisticsStatusGroup(value);
        onFilterChange({ logisticsStatusGroup: value, logisticsStep: 'all' }); // Reset logisticsStep when status group changes
    };


    const handleLogisticsStepChange = (value) => {
        onFilterChange({ logisticsStep: value });
    };

    // **ADD THIS handleAgreementChange FUNCTION - THIS WAS MISSING**
    const handleAgreementChange = (value) => {
        onFilterChange({ agreement: value }); // Updates 'agreement' filter in parent component
    };


    return (
        <div data-name="global-filters" className="bg-white shadow-sm p-4 rounded-lg mb-6">
            <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                    <label className="text-gray-600">Período:</label>
                    <select
                        data-name="period-filter"
                        className="border rounded-lg px-3 py-2"
                        value={filters.period}
                        onChange={(e) => onFilterChange({ period: e.target.value })}
                    >
                        {currentFilters.periods.map(period => (
                            <option key={period.id} value={period.id}>
                                {period.label}
                            </option>
                        ))}
                    </select>
                </div>

                {currentFilters.regions && (
                    <div className="flex items-center space-x-2">
                        <label className="text-gray-600">Região:</label>
                        <select
                            data-name="region-filter"
                            className="border rounded-lg px-3 py-2"
                            value={filters.region}
                            onChange={(e) => onFilterChange({ region: e.target.value })}
                        >
                            {currentFilters.regions.map(region => (
                                <option key={region.id} value={region.id}>
                                    {region.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {currentFilters.agreementCategories && (
                    <div className="flex items-center space-x-2">
                        <label className="text-gray-600">Categoria:</label>
                        <select
                            data-name="agreement-category-filter"
                            className="border rounded-lg px-3 py-2"
                            value={selectedMainAgreement}
                            onChange={(e) => handleMainAgreementChange(e.target.value)} // **handleMainAgreementChange**
                            disabled={loadingAgreements}
                        >
                            {Object.entries(currentAgreementCategories).map(([key, category]) => (
                                <option key={key} value={key}>
                                    {category.label}
                                </option>
                            ))}
                        </select>

                        {selectedMainAgreement !== 'all' && (
                            <div className="flex items-center space-x-2">
                                <label className="text-gray-600">Convênio:</label>
                                <select
                                    data-name="agreement-filter"
                                    className="border rounded-lg px-3 py-2"
                                    value={filters.agreement}
                                    onChange={(e) => handleAgreementChange(e.target.value)} // **handleAgreementChange**
                                    disabled={loadingAgreements}
                                >
                                    <option value="all">Todos</option>
                                    {currentAgreementCategories[selectedMainAgreement].agreements.map(agreement => (
                                        <option key={agreement.id} value={agreement.id}>
                                            {agreement.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {currentFilters.logisticsTypes && ( // NEW: Logistics Type Filter Section
                    <div className="flex items-center space-x-2">
                        <label className="text-gray-600">Tipo:</label>
                        <select
                            data-name="logistics-type-filter"
                            className="border rounded-lg px-3 py-2"
                            value={filters.logisticsType}
                            onChange={(e) => handleLogisticsTypeChange(e.target.value)}
                        >
                            {currentFilters.logisticsTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {currentFilters.logisticsStepsGroups && selectedLogisticsType !== 'all' && ( // NEW: Logistics Status Group and Steps Filters
                    <>
                        <div className="flex items-center space-x-2">
                            <label className="text-gray-600">Status:</label> {/* NEW: Status Group Filter Label */}
                            <select
                                data-name="logistics-status-group-filter"
                                className="border rounded-lg px-3 py-2"
                                value={selectedLogisticsStatusGroup} // Bind to selectedLogisticsStatusGroup state
                                onChange={(e) => handleLogisticsStatusGroupChange(e.target.value)} // NEW: Handler for Status Group Change
                            >
                                <option value="all">Todas</option>
                                {Object.entries(currentFilters.logisticsStepsGroups).filter(([key]) => key !== 'all').map(([key, group]) => ( // Render Status Groups (excluding 'all')
                                    <option key={key} value={key}>
                                        {group.label} {/* Status Group Label */}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedLogisticsStatusGroup !== 'all' && currentLogisticsSteps[selectedLogisticsStatusGroup] && ( // Conditionally render Steps filter
                            <div className="flex items-center space-x-2">
                                <label className="text-gray-600">Etapas:</label> {/* NEW: Steps Filter Label */}
                                <select
                                    data-name="logistics-step-filter"
                                    className="border rounded-lg px-3 py-2"
                                    value={filters.logisticsStep}
                                    onChange={(e) => handleLogisticsStepChange(e.target.value)}
                                >
                                    <option value="all">Todas</option>
                                    {currentLogisticsSteps[selectedLogisticsStatusGroup].steps.map(step => ( // Render Steps based on selected Status Group
                                        <option key={step.id} value={step.id}>
                                            {step.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                )}


            </div>
        </div>
    );


}

export default GlobalFilters;