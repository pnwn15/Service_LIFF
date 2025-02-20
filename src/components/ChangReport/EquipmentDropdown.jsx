import React from 'react';

const EquipmentDropdown = ({ equipment }) => {
    return (
        <div className="mb-4">
            <label htmlFor="equipment" className="block text-sm font-semibold text-gray-700 mb-2">Select Equipment</label>
            <select
                id="equipment"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select Equipment</option>
                {equipment && equipment.length > 0 ? (
                    equipment.map((equip, index) => (
                        <option key={index} value={equip.id}>
                            {equip.name}
                        </option>
                    ))
                ) : (
                    <option>No equipment available</option>
                )}
            </select>
        </div>
    );
};

export default EquipmentDropdown;
