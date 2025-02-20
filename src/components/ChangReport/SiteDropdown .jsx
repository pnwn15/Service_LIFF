import React from 'react';

const SiteDropdown = ({ sites, setSelectedSite }) => {
    const handleSiteChange = (e) => {
        setSelectedSite(e.target.value); // ส่งค่า id ของพนักงานที่เลือกไปยัง setSelectedEmployee
    };
    return (
        <div className="">
            <select
                id="partner"
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleSiteChange}
            >
                <option value="">เลือกไซต์งาน</option>
                {sites && sites.length > 0 ? (
                    sites[0].map((partner,index) => (
                        <option key={index} value={partner.id}>
                            {partner.name}
                        </option>
                    ))
                ) : (
                    <option>No sites available</option>
                )}
            </select>
        </div>
    );
};

export default SiteDropdown;
