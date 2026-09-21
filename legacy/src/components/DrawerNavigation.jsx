import React from 'react';

function DrawerNavigation({ isOpen, onClose, activeTab, onTabChange }) {
    const tabs = [ // **Define the tabs array here - same as in Navigation.jsx**
        { id: 'cardProcessing', label: 'Processamento de Cartões', icon: 'fa-credit-card' },
        { id: 'financial', label: 'Desempenho Financeiro', icon: 'fa-chart-line' },
        { id: 'inventory', label: 'Gestão de Estoque', icon: 'fa-box' },
        { id: 'logistics', label: 'Logistica', icon: 'fa-truck' }
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out z-50 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } sm:hidden`}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-800"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>

            <nav className="mt-12 px-4">
                <ul className="space-y-2">
                    {tabs.map(tab => ( // **Map over the tabs array**
                        <li key={tab.id}>
                            <button
                                data-name={`drawer-tab-${tab.id}`} // Added data-name for consistency
                                className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 w-full text-left ${
                                    activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600'
                                }`} // Slightly adjusted classes - removed transition-colors for drawer tabs for now, adjust as you like
                                onClick={() => onTabChange(tab.id)}
                            >
                                <i className={`fas ${tab.icon} mr-2`}></i>
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default DrawerNavigation;