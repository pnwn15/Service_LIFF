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
import * as XLSX from 'xlsx';
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

            const [employeesRes, sitesRes] = await Promise.all([
                axios.get('/api/admin/data?data_type=employees'),
                axios.get('/api/admin/data?data_type=partners')
            ]);

            setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : Object.values(employeesRes.data) || []);
            setSites(Array.isArray(sitesRes.data) ? sitesRes.data : Object.values(sitesRes.data) || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get('/api/admin/search-report', {
                params: {
                    employee_id: selectedEmployee,
                    site_id: selectedSite,
                    start_date: dateRange[0] ? dateRange[0].toISOString() : null,
                    end_date: dateRange[1] ? dateRange[1].toISOString() : null,
                    job_type: selectedJobType,
                }
            });
            setSearchResults(response.data.reports);
        } catch (error) {
            console.error('Error searching employee data:', error);
        }
    };

    const exportToExcel = (data, fileName) => {
        // กรองข้อมูลเพื่อลบคอลัมน์ที่ไม่ต้องการ
        const filteredData = data.map(item => {
            const { images_after, images_before, images, participants, request_id, request_name, equipment_list, ...rest } = item;
            return rest;
        });

        
        // สร้างเวิร์กชีตจากข้อมูลที่กรองแล้ว
        const ws = XLSX.utils.json_to_sheet(filteredData);

        const headerStyle = {
            font: { bold: true, color: { rgb: "#FFFFFF" } }, // ตัวหนา, สีฟอนต์ขาว
            fill: { fgColor: { rgb: "#00FF00" } }, // สีพื้นหลังหัวตาราง (สีเขียว)
            alignment: { horizontal: "center", vertical: "center" }, // จัดข้อความกึ่งกลาง
            border: {
                top: { style: "thin", color: { rgb: "#000000" } },
                bottom: { style: "thin", color: { rgb: "#000000" } },
                left: { style: "thin", color: { rgb: "#000000" } },
                right: { style: "thin", color: { rgb: "#000000" } }
            }
        };


        // กำหนดสไตล์สำหรับข้อมูลในเซลล์
        const cellStyle = {
            alignment: { horizontal: "center", vertical: "center" }, // จัดข้อความกึ่งกลาง
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        };

        // กำหนดสไตล์ให้กับหัวตาราง
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            if (!ws[address]) continue;
            ws[address].s = headerStyle; // กำหนดสไตล์ให้กับหัวตาราง
        }

        // กำหนดสไตล์ให้กับข้อมูลในเซลล์
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[address]) continue;
                ws[address].s = cellStyle; // กำหนดสไตล์ให้กับข้อมูลในเซลล์
            }
        }

        // กำหนดความกว้างของคอลัมน์
        ws['!cols'] = [
            { wch: 10 }, // ความกว้างคอลัมน์ที่ 1
            { wch: 25 }, // ความกว้างคอลัมน์ที่ 2
            { wch: 15 }, // ความกว้างคอลัมน์ที่ 3
            { wch: 25 }, // ความกว้างคอลัมน์ที่ 4
            { wch: 20 }, // ความกว้างคอลัมน์ที่ 5
            { wch: 20 }, // ความกว้างคอลัมน์ที่ 6
            { wch: 20 }, // ความกว้างคอลัมน์ที่ 7
            { wch: 20 }, // ความกว้างคอลัมน์ที่ 8
            { wch: 15 }, // ความกว้างคอลัมน์ที่ 8
            { wch: 20 }, // ความกว้างคอลัมน์ที่ 8
        ];
        
        // สร้างเวิร์กบุ๊กและเพิ่มเวิร์กชีต
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ผลโดยรวม");
        // บันทึกไฟล์ Excel
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    };


    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: <span className="text-xl font-bold">ชื่อรายงาน</span>,
            dataIndex: 'name',
            key: 'name',
            width: 220,
            ellipsis: true,
            render: (text) => <span className="text-lg">{text || '-'}</span>,
        },
        {
            title: <span className="text-xl font-bold">เวลาที่สร้าง</span>,
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
            title: <span className="text-xl font-bold">เวลาในการทำงาน</span>,
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
            title: <span className="text-xl font-bold">เวลาที่เสร็จสิ้น</span>,
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
            title: <span className="text-xl font-bold">ไซต์งาน</span>,
            dataIndex: 'site_name',
            key: 'site_name',
            width: 150,
            ellipsis: true,
            render: (text) => <span className="text-lg">{text || '-'}</span>,
        },
        {
            title: <span className="text-xl font-bold">อุปกรณ์</span>,
            dataIndex: selectedJobType === "PM" ? 'equipment_list' : 'equipment_name',
            key: 'equipment',
            width: 150,
            ellipsis: false,
            render: (equipments) => (
                <span className="text-lg">{Array.isArray(equipments) ? equipments.join(', ') : equipments || '-'}</span>
            )
        },
        {
            title: <span className="text-xl font-bold">สถานะ</span>,
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (text) => <span className="text-lg font-semibold">{text || '-'}</span>,
        },
        {
            title: <span className="text-xl font-bold">ผู้ตรวจสอบ</span>,
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
                <Content className='p-10 w-full h-screen bg-slate-800 '>
                    <div className="max-w-full mx-auto p-6 border border-white  shadow-white  bg-white rounded-lg overflow-auto shadow-md">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Report Technician</h1>

                        <div className="flex gap-2 items-center justify-end mb-2">
                            <EmployeeDropdown
                                employees={employees}
                                setSelectedEmployee={setSelectedEmployee}
                            />

                            <SiteDropdown
                                sites={sites}
                                setSelectedSite={setSelectedSite}
                            />
                            <RangePicker
                                className="w-72"
                                placeholder={['เลือกวันที่เริ่มต้น', 'เลือกวันที่สิ้นสุด']}
                                onChange={(dates) => setDateRange(dates)}
                            />
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

                        <div className='flex gap-2 w-56'>
                            <div className="flex w-full ">
                                <DownloadPDF searchResults={selectedData} />
                            </div>
                            <div className="flex w-full ">
                                <DownloadReportImage searchResults={selectedData} />
                            </div>
                            <div className="flex w-full ">
                                <Button
                                    type="primary"
                                    onClick={() => exportToExcel(searchResults, 'report')}
                                    style={{ marginLeft: 8 }}
                                >
                                    ดาวน์โหลด Excel
                                </Button>
                            </div>
                        </div>

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