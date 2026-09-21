import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import DrawerNavigation from './components/DrawerNavigation';
import GlobalFilters from './components/GlobalFilters';
import CardProcessing from './pages/CardProcessing';
import FinancialPerformance from './pages/FinancialPerformance';
import InventoryManagement from './pages/InventoryManagement';
import Logistics from './pages/Logistics';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('cardProcessing');
    const [filters, setFilters] = useState({
        period: 'all',
        region: 'all',
        agreementCategory: 'all', // **ADDED agreementCategory to filters state**
        agreement: 'all',
        logisticsType: 'all',
        logisticsStep: 'all',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleFilterChange = (newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    const setModalOpen = (openState) => {
        setIsModalOpen(openState);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsDrawerOpen(false);
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    useEffect(() => {
        // Example useEffect - you can keep or adjust as needed
    }, [isModalOpen]);

    return (
        <div data-name="dashboard-container" className="dashboard-container">
            {/* Hamburger Button */}
            <button
                onClick={toggleDrawer}
                className="block sm:hidden p-2 focus:outline-none"
                aria-label="Open navigation menu"
            >
                <i className="fas fa-bars text-gray-700 text-xl"></i>
            </button>

            {/* Navigation Original */}
            <Navigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                className="hidden sm:flex"
            />

            {/* Drawer Navigation */}
            <DrawerNavigation
                isOpen={isDrawerOpen}
                onClose={toggleDrawer}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            <GlobalFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                activeTab={activeTab}
            />

            <div data-name="tab-content" className="tab-content">
                {activeTab === 'cardProcessing' && (
                    <CardProcessing filters={filters} setModalOpen={setModalOpen} />
                )}
                {activeTab === 'financial' && (
                    <FinancialPerformance filters={filters} setModalOpen={setModalOpen} />
                )}
                {activeTab === 'inventory' && (
                    <InventoryManagement filters={filters} setModalOpen={setModalOpen} />
                )}
                {activeTab === 'logistics' && (
                    <Logistics filters={filters} setModalOpen={setModalOpen} /> // Using the new Logistics component
                )}
            </div>
        </div>
    );
}

export default App;