import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { formatPercentage } from '../utils/formatters';

const BrazilMapChart = ({ unlockData }) => {
    console.log("BrazilMapChart - unlockData prop:", unlockData); // Keep this log

    const center = [-15.7934, -47.8822];
    const zoom = 4;

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{
                height: '500px',
                width: '100%',
                zIndex: 1 // Add this line to set a lower z-index
            }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {unlockData && unlockData.map((cityData, index) => (
                <Marker key={index} position={[-23.5505, -46.6333]}> {/* Hardcoded position for testing */}
                    <Popup>
                        <div>
                            <b>Test Popup</b><br/>
                            This is a test pin.
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default BrazilMapChart;