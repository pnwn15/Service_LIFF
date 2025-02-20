'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { getUser } from '@/lib/userManipulate'; 
import EmployeeDropdown from '@/components/ChangReport/EmployeeDropdown';
import SiteDropdown from '@/components/ChangReport/SiteDropdown ';
import { DatePicker, Button, Layout, Radio } from 'antd';
import dynamic from 'next/dynamic';
import DownloadPDF from '@/components/InvoicePDF/DownloadPDF';
import Loading from '@/components/LoadingPage';
import DownloadReportImage from '@/components/InvoicePDF/DownloadReportImage';
const { RangePicker } = DatePicker;
const { Content } = Layout;
import moment from 'moment';
const Table = dynamic(() => import('antd').then(mod => mod.Table), { ssr: false });
const NavbarAdmin = dynamic(() => import("@/components/NavbarAdmin"), { ssr: false });


const AdminPage = () => {
    const [employees, setEmployees] = useState([]); // เก็บข้อมูลพนักงาน
    const [sites, setSites] = useState([]); // เก็บข้อมูล sites
    const [selectedEmployee, setSelectedEmployee] = useState(''); // เก็บข้อมูลพนักงานที่เลือก
    const [selectedSite, setSelectedSite] = useState(''); // เก็บข้อมูล site ที่เลือก
    const [searchResults, setSearchResults] = useState([]); // เก็บผลลัพธ์การค้นหาจาก API
    const [dateRange, setDateRange] = useState([null, null]); // State สำหรับเก็บช่วงวันที่
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(true)
    const [selectedJobType, setSelectedJobType] = useState('BM'); // Default value
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const fetchUser = async () => {
        let result = {};
        try {
            result = await getUser();
            setUser(result)
        } catch (error) {
            console.log(error);
        }
        return result;
    };

    // ฟังก์ชันดึงข้อมูลจาก API
    const handleJobTypeChange = (e) => {
        setSelectedJobType(e.target.value);
    };
    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const selectedData = searchResults.filter(item => selectedRowKeys.includes(item.id));
    const fetchData = async () => {
        try {
            const usr = await fetchUser();
            if (!usr) throw new Error('No authorized');

            // ดึงข้อมูลจาก API ทั้ง 2 ประเภท
            const [employeesRes, sitesRes] = await Promise.all([
                axios.get('/api/admin/data?data_type=employees'),
                axios.get('/api/admin/data?data_type=partners')  // ดึงข้อมูล sites
            ]);

            setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : Object.values(employeesRes.data) || []);
            setSites(Array.isArray(sitesRes.data) ? sitesRes.data : Object.values(sitesRes.data) || []); // เก็บข้อมูล site
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // ฟังก์ชันค้นหาข้อมูลจาก API ตาม employee_id และ site_id
    const handleSearch = async () => {
        try {
            // ค้นหาจาก API ตาม employee_id และ site_id
            const response = await axios.get('/api/admin/search-report', {
                params: {
                    employee_id: selectedEmployee,
                    site_id: selectedSite,  // ส่ง site_id ใน query parameters
                    start_date: dateRange[0] ? dateRange[0].toISOString() : null,  // ส่ง start_date
                    end_date: dateRange[1] ? dateRange[1].toISOString() : null   ,   // ส่ง end_date
                    job_type: selectedJobType,  // ส่งค่า PM หรือ BM ไปใน query
                }
            });
            setSearchResults(response.data.reports); // เก็บผลการค้นหาไว้ใน state
           
        } catch (error) {
            console.error('Error searching employee data:', error);
        }
    };

    // ใช้ useEffect เพื่อดึงข้อมูลเมื่อหน้าโหลด
    useEffect(() => {
        fetchData();
    }, []);

    // Columns for the Ant Design Table
    const columns = [
        {
            title: <span className="text-xl font-bold">Report Name</span>,
            dataIndex: 'name',
            key: 'name',
            width: 220,
            ellipsis: true,
            render: (text) => <span className="text-lg">{text || '-'}</span>,
        },
        {
            title: <span className="text-xl font-bold">Create Time</span>,
            dataIndex: 'create_date',
            key: 'create_date',
            width: 180,
            
            render: (text) => (
                <span className="text-lg">
                    {text ? moment(text).format('DD-MM-YYYY HH:mm') : '-'}
                </span>
            ),
        },
        {
            title: <span className="text-xl font-bold">Write Time</span>,
            dataIndex: 'write_date',
            key: 'write_date',
            width: 180,
            render: (text) => (
                <span className="text-lg">
                    {text ? moment(text).format('DD-MM-YYYY HH:mm') : '-'}
                </span>
            ),
        },
        {
            title: <span className="text-xl font-bold">End Time</span>,
            dataIndex: 'end_date',
            key: 'end_date',
            width: 180,
            render: (text) => (
                <span className="text-lg">
                    {text ? moment(text).format('DD-MM-YYYY HH:mm') : '-'}
                </span>
            ),
        },
        {
            title: <span className="text-xl font-bold">Site Name</span>,
            dataIndex: 'site_name',
            key: 'site_name',
            width: 150,
            ellipsis: true,
            render: (text) => <span className="text-lg">{text || '-'}</span>,
        },
        {
            title: <span className="text-xl font-bold">Equipment</span>,
            dataIndex: selectedJobType === "PM" ? 'equipment_list' : 'equipment_name',
            key: 'equipment',
            width: 150,
            ellipsis: false,
            render: (equipments) => (
                <span className="text-lg">{Array.isArray(equipments) ? equipments.join(', ') : equipments || '-'}</span>
            )
        },

        {
            title: <span className="text-xl font-bold">Status</span>,
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (text) => <span className="text-lg font-semibold">{text || '-'}</span>,
        },
        {
            title: <span className="text-xl font-bold">Participants</span>,
            dataIndex: 'participants',
            key: 'participants',
            width: 120,
            render: (text) => <span className="text-lg">{text || '-'}</span>,
        },
    ];
    if (isLoading) return (<Loading />)
    if (user?.department !== "Administration" && user?.department !== "ผู้ดูแลระบบ") {
        return (
            <div className='flex justify-center items-center h-screen w-screen'>
                <div className='flex flex-col font-bold justify-center items-center gap-2'>
                    <div className="font24">
                        No access to this page!!!
                    </div>
                    <Button type="primary" href="/">Back to Home</Button>
                </div>
            </div>
        );
    }

        return (
                <NavbarAdmin>
                <div>
                    {/* Main Content */}
                    <Content className='p-10 w-screen h-screen'>
                        <div className="max-w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
                            <h1 className="text-2xl font-bold text-gray-800 mb-6">Report Technician</h1>

                            <div className="flex gap-2 items-center justify-end mb-2">
                                {/* ใช้ EmployeeDropdown Component */}
                                <EmployeeDropdown
                                    employees={employees}
                                    setSelectedEmployee={setSelectedEmployee}
                                />

                                {/* ใช้ SiteDropdown Component */}
                                <SiteDropdown
                                    sites={sites}
                                    setSelectedSite={setSelectedSite} // เก็บข้อมูล site ที่เลือก
                                />
                                <RangePicker
                                    className="w-72"
                                    placeholder={['เลือกวันที่เริ่มต้น', 'เลือกวันที่สิ้นสุด']}
                                    onChange={(dates) => setDateRange(dates)}
                                />
                                {/* ปุ่มค้นหาพนักงาน */}
                                {/* ตัวเลือก PM หรือ BM */}
                                <Radio.Group onChange={handleJobTypeChange} value={selectedJobType}>
                                    <Radio value="PM">PM</Radio>
                                    <Radio value="BM">BM</Radio>
                                </Radio.Group>
                                <Button
                                    type="primary"
                                    onClick={handleSearch}
                                    style={{ marginLeft: 8 }}
                                >
                                    ค้นหา
                                </Button>
                            </div>

                            {/* Export PDF Button */}
                            <div className='flex gap-2 w-56'>
                                <div className="flex w-full ">
                                    <DownloadPDF searchResults={selectedData} />
                                </div>
                                <div className="flex w-full ">
                                    <DownloadReportImage searchResults={selectedData} />
                                </div>
                            </div>
                           

                            {/* แสดงผลลัพธ์ในตาราง Ant Design */}
                            <div className="p-10">
                                <Table
                                    rowSelection={rowSelection}
                                    columns={columns}
                                    dataSource={searchResults.map((item) => ({ ...item, key: item.id }))} 
                                    locale={{ emptyText: 'ไม่พบข้อมูลที่ตรงกับการค้นหา' }}
                                    scroll={{ y: 400 }}
                                   
                                    onRow={(_, rowIndex) => ({
                                        className: `cursor-pointer ${rowIndex % 2 === 0 ? 'bg-gray-50 ' : 'bg-white'} hover:bg-gray-200`,
                                    })}
                                />
                            </div>
                        </div>
                    </Content>
            </div>

                </NavbarAdmin>


        );
}

export default AdminPage;
