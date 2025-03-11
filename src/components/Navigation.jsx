import React from 'react';

function Navigation({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'cardProcessing', label: 'Processamento de Cartões', icon: 'fa-credit-card' },
        { id: 'financial', label: 'Desempenho Financeiro', icon: 'fa-chart-line' },
        { id: 'inventory', label: 'Gestão de Estoque', icon: 'fa-box' },
        { id: 'logistics', label: 'Logistica', icon: 'fa-truck' }
    ];

    return (
        <nav data-name="navigation" className="bg-white shadow-sm mb-6 p-4 rounded-lg">
            <div className="flex space-x-4 hidden sm:flex">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        data-name={`nav-tab-${tab.id}`}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors
                            ${activeTab === tab.id 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-600 hover:bg-gray-100'}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <i className={`fas ${tab.icon} mr-2`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}

export default Navigation;