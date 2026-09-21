import React, {useState, useEffect, useRef} from 'react';
import '../styles/KPICard.css'; // Import the CSS file

function KPICard({
    title,
    value,
    subtitle,
    percentage,
    trend,
    icon,
    onClick,
    onWorkflowClick,
    showWorkflowButtons = true,
    reasons = [],
    color = 'blue',
    cardClassName = "",
    titleClassName = "",
    valueClassName = "",
    subtitleClassName = "",
    iconClassName = "",
    workflowButtonClassName = "",
    summaryContent = null,
    summaryValues = null
}) {
    if (!title) {
        console.error("KPICard received undefined title prop.");
        return (
            <div className="kpi-card kpi-card--undefined rounded-lg p-5 shadow-md border bg-gray-100 border-gray-200">
                <h3 className="kpi-card__undefined-title text-lg font-semibold text-gray-500">Título Indefinido</h3>
                <p className="kpi-card__undefined-value text-xl font-bold text-gray-500">Valor Indefinido</p>
                <p className="kpi-card__undefined-subtitle mt-2 text-sm text-gray-500">Subtítulo Indefinido</p>
            </div>
        );
    }
    const [isSummaryVisible, setIsSummaryVisible] = useState(false);
    const buttonsRef = useRef(null);
    const summaryRef = useRef(null);
    const cardRef = useRef(null); // Ref para o container principal para animação

    const getTrendIcon = () => {
        if (!trend) return null;
        return trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down';
    };

    const handleWorkflowClick = (type, e) => {
        e.stopPropagation();
        onWorkflowClick && onWorkflowClick(type);
    };

    const toggleView = (e) => {
        e.stopPropagation();
        setIsSummaryVisible(!isSummaryVisible);
        console.log("Botão Toggle View clicado - isSummaryVisible:", !isSummaryVisible);
    };


    useEffect(() => {
        const buttonsEl = buttonsRef.current;
        const summaryEl = summaryRef.current;

        if (buttonsEl && summaryEl) {
            if (isSummaryVisible) {
                // Summary View (indo de Fluxos para Resumo)
                summaryEl.classList.remove('hidden'); // Mostrar o resumo ANTES de animar a entrada
                buttonsEl.classList.remove('slide-in-right'); // Remover classe de entrada para garantir que não interfira
                buttonsEl.classList.add('slide-out-right'); // Animar saída dos botões
                summaryEl.classList.add('slide-in-left');   // Animar entrada do resumo
                summaryEl.classList.remove('slide-out-left'); // Remover classe de saída


                setTimeout(() => { // Manter o timeout para esconder os botões DEPOIS da animação de SAÍDA
                    buttonsEl.classList.add('hidden');
                }, 300);


            } else {
                // Flows View (indo de Resumo para Fluxos)
                buttonsEl.classList.remove('hidden'); // Mostrar os botões ANTES de animar a entrada
                summaryEl.classList.remove('slide-in-left'); // Remover classe de entrada para garantir que não interfira
                summaryEl.classList.add('slide-out-left');  // Animar saída do resumo
                buttonsEl.classList.add('slide-in-right');    // Animar entrada dos botões
                buttonsEl.classList.remove('slide-out-right'); // Remover classe de saída

                setTimeout(() => { // Manter o timeout para esconder o resumo DEPOIS da animação de SAÍDA
                    summaryEl.classList.add('hidden');
                }, 300);
            }
        }
    }, [isSummaryVisible]);


    return (
        <div
            ref={cardRef}
            data-name={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className={`kpi-card rounded-lg p-5 shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer border flex flex-col ${cardClassName} ${isSummaryVisible ? 'kpi-card--summary-mode flex flex-col' : 'flex flex-col'}`}
            onClick={() => onClick && onClick('details')} // MODIFIED onClick
            style={{ '--kpi-card-color': color }}
        >
            <div className="kpi-card__header flex justify-around items-center mb-4">
                <h3 className={`kpi-card__title text-lg font-semibold text-gray-700 ${titleClassName}`}>{title}</h3>
                {icon && (
                    <i className={`kpi-card__icon fas ${icon} ${iconClassName}`}></i>
                )}
            </div>

            {/* Value and Subtitle - ALWAYS VISIBLE */}
            <div className={`kpi-card__value-container`}>
                <span className={`kpi-card__value text-2xl font-bold ${valueClassName}`}>{value}</span>
                {percentage && (
                    <span className="kpi-card__percentage text-sm text-gray-500">
                        ({percentage}%)
                    </span>
                )}
            </div>

            {subtitle && (
                <div className={`kpi-card__subtitle-container mt-2 text-sm text-gray-600 ${subtitleClassName}`}>
                    <span className="kpi-card__subtitle-text">{subtitle}</span>
                    {trend && (
                        <span className={`kpi-card__trend ml-2`}>
                            <i className={`fas ${getTrendIcon()} mr-1`}></i>
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            )}

            {/* Workflow and Toggle View Buttons - Container ALWAYS VISIBLE */}
            <div ref={buttonsRef} className={`kpi-card__workflow-buttons kpi-card__workflow-buttons--animated mt-4 flex justify-center space-x-2 border-t pt-4 order-3 transition-opacity duration-300 ease-in-out ${isSummaryVisible ? 'hidden' : 'flex'}`}>
                {/* Workflow Buttons - Show only when NOT in Summary View */}
                {showWorkflowButtons && (
                    <>
                        <button
                            data-name="flowchart-btn"
                            className={`kpi-card__workflow-button workflow-button hover:opacity-75 p-2 rounded-full bg-white shadow-sm ${workflowButtonClassName}`}
                            onClick={(e) => handleWorkflowClick('flowchart', e)}
                            title="Fluxograma"
                        >
                            <i className="fas fa-diagram-project"></i>
                        </button>
                        <button
                            data-name="orgchart-btn"
                            className={`kpi-card__workflow-button workflow-button hover:opacity-75 p-2 rounded-full bg-white shadow-sm ${workflowButtonClassName}`}
                            onClick={(e) => handleWorkflowClick('orgchart', e)}
                            title="Organograma"
                        >
                            <i className="fas fa-sitemap"></i>
                        </button>
                        <button
                            data-name="docs-btn"
                            className={`kpi-card__workflow-button workflow-button hover:opacity-75 p-2 rounded-full bg-white shadow-sm ${workflowButtonClassName}`}
                            onClick={(e) => handleWorkflowClick('docs', e)}
                            title="POPs e Vídeos"
                        >
                            <i className="fas fa-file-video"></i>
                        </button>
                    </>
                )}


            </div>
             {/* Toggle View Buttons - Container ALWAYS VISIBLE */}
             <div className={`mt-4 flex justify-center space-x-2 border-t pt-4 order-3 transition-opacity duration-300 ease-in-out flex `}>
                {isSummaryVisible && (
                    <button
                        data-name="ver-fluxos-btn"
                        className={`kpi-card__workflow-button ver-fluxos-button hover:opacity-75 p-2 rounded-md shadow-sm ${workflowButtonClassName} text-blue-600 font-semibold bg-transparent`}
                        style={{ backgroundColor: 'transparent' }}
                        onClick={(e) => toggleView(e)}
                        title="Ver Fluxos"
                    >
                        Ver Fluxos
                    </button>
                )}
                {/* "Ver Resumo" Button - Show only in Flows View */}
                {!isSummaryVisible && (
                    <button
                        data-name="ver-resumo-btn"
                        className={`kpi-card__workflow-button ver-resumo-button hover:opacity-75 p-2 rounded-md shadow-sm ${workflowButtonClassName} text-blue-600 font-semibold bg-transparent`}
                        style={{ backgroundColor: 'transparent' }}
                        onClick={(e) => toggleView(e)}
                        title="Ver Resumo"
                    >
                        Ver Resumo
                    </button>
                )}
            </div>


            <div ref={summaryRef} className={`kpi-card__summary-content kpi-card__summary-content--animated mt-4 border-t pt-4 hidden`}> {/* Hidden by default and visibility controlled by classes */}
                {/* Display original values inside the summary */}
                {summaryValues && (
                    <div className="kpi-card__summary-values">
                        {summaryValues.map((item, index) => (
                            <p key={index} className="text-sm text-gray-700">{item}</p>
                        ))}
                    </div>
                )}
                {summaryContent}
            </div>
        </div>
    );
}

export default KPICard;