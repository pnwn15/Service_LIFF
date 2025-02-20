import React from 'react';

const EmployeeDropdown = ({ employees, setSelectedEmployee }) => {
    const handleEmployeeChange = (e) => {
        // console.log('e',e.target.value)
        setSelectedEmployee(e.target.value); // ส่งค่า id ของพนักงานที่เลือกไปยัง setSelectedEmployee
    };

    return (
        <div className="">
          
            <select
                id="employee"
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleEmployeeChange} // เมื่อมีการเลือกใหม่จะเรียก handleEmployeeChange
            >
                <option value="">เลือกพนักงาน</option>
                {employees && employees.length > 0 ? (
                    employees[0].map((employee, index) => (
                        <option key={index} value={employee.user_id}>
                            {employee.name}
                        </option>
                    ))
                ) : (
                    <option>No employees available</option>
                )}
            </select>
        </div>
    );
};

export default EmployeeDropdown;
