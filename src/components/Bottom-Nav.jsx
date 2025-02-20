'use client'
import React, { useState ,useEffect} from 'react';
import { FaUser } from "react-icons/fa";
import { RiQrScan2Line } from "react-icons/ri";
import { IoHome } from "react-icons/io5";

import { useContext } from 'react';
import LiffContext from "./LIFF/LiffContext";

import { message, notification } from "antd";
import { getUser } from '@/lib/userManipulate';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

const BottomNav = ({ children }) => {

    const { LIFF } = useContext(LiffContext);
    const [messageApi, contextHolder] = message.useMessage();
    const [dataUser, setDataUser] = useState({});


    const pathname = usePathname();
    const router = useRouter();

    // console.log(pathname)
    const popups = (type, msg) => {
        messageApi.open({
            key: msg,
            type: type,
            content: msg,
        });
    };

    const statusMapping = {
        0: "pending",
        1: "in_progress",
        2: "break_down",
        3: "complete"
    };
    const fetchUser = async () => {
        let result = {};
        try {
            result = await getUser();
            setDataUser(result);
            // console.log("result: ", result);
        } catch (error) {
            console.log(error);
        };

        return result;
    };
    // console.log(dataUser)
    useEffect(() => {
        fetchUser();
    }, []);

    const LiffScanner = async () => {
        console.log('scanning');
        if (LIFF) {
            if (LIFF.isLoggedIn()) {
                try {
                    const result = await LIFF.scanCodeV2(); // QR scanner
                    if (result.value) {
                        const scannedSerial = result.value.toString();

                        const usr = await fetchUser(); // Ensure user is authorized
                        if (!usr) throw new Error('No authorized');

                        // Call API to fetch jobs based on scanned serial number
                        const res = await axios.get(`/api/maintenance/jobs?&showall=true&sr=${scannedSerial}`);
                        if (res.data && res.data.data.length > 0) {
                            const job = res.data.data[0]; // Assume first job, or adjust logic as needed
                            const equipmentResponse = await axios.get(`/api/maintenance/job/${job.id}`);
                            const equipmentData = equipmentResponse.data;
                            const matchedEquipment = equipmentData.equipments?.find(eq => eq.serial_no === scannedSerial);

                            if (matchedEquipment) {
                                // Check if there is a participant already working on this task
                                const participantData = await axios.get('/api/data/user-src');

                                let participantsList = participantData.data.data; // รายการผู้ใช้งานทั้งหมด

                                if (matchedEquipment.participants && matchedEquipment.participants !== usr.user_id) {
                                    let matchedUser = participantsList.find(ptp => ptp.id === matchedEquipment.participants);

                                    notification.info({
                                        message: 'Task In Progress',
                                        description: `${matchedUser} is currently working on this task.`,
                                    });
                                    return;
                                }


                                // Redirect immediately if status matches
                                if (["pending", "in_progress", "complete"].includes(matchedEquipment.status)) {
                                    router.push(`/technician/task/${job.id}/equipment/${matchedEquipment.id}`);
                                } else {
                                    await axios.patch(`/api/maintenance/report`, {
                                        job_id: parseInt(job.id),
                                        equipment_id: parseInt(matchedEquipment.id),
                                        status: statusMapping[0],
                                        participants: usr.user_id
                                    });

                                    notification.success({
                                        message: 'Status Updated',
                                        description: 'Equipment status has been updated to pending.',
                                    });

                                    // Redirect to the task page after updating status
                                    router.push(`/technician/task/${job.id}/equipment/${matchedEquipment.id}`);
                                }
                            } else {
                                popups('error', 'No matching equipment found');
                            }
                        } else {
                            popups('error', 'No jobs found for scanned serial number');
                        };
                    };
                } catch (err) {
                    console.log(err);
                    popups('error', 'Scan failed');
                };
            };
        };
    };


    return (
        <div className='mt-2'>
            {children}
            {contextHolder}
            <div className="fixed mt-5 bottom-0 left-0 right-0 bg-white mb-2 mx-2 rounded-full shadow-md border border-gray-200 hide-on-keyboard">
                <div className="flex justify-around items-center h-16">
                    {/* Home */}
                    <button onClick={() => router.push('/technician/task')} className={`flex flex-col items-center justify-center ${pathname.includes('/task') ? "text-blue-500 scale-105" : "text-gray-500"}   hover:font-bold  transition-all duration-150`}>
                        <IoHome className="w-6 h-6" />
                        {/*    <span className="text-xs">Home</span> */}
                    </button>

                    {/* Search */}
                    <button onClick={() => LiffScanner()} className={`flex flex-col items-center justify-center ${pathname.includes('/technician/qr') ? "text-blue-500 scale-105" : "text-gray-500"}   hover:font-bold  transition-all duration-150`}>
                        <RiQrScan2Line className="w-6 h-6" />
                        {/*    <span className="text-xs">Scan</span> */}
                    </button>

                    {/* Profile */}
                    {
                        dataUser.department == "Administration" || dataUser.department == "ผู้ดูแลระบบ" ? (
                            <button
                                onClick={() => router.push('/technician/admin')}
                                className={`flex flex-col items-center justify-center ${pathname.includes('/profile') ? "text-blue-500 scale-105" : "text-gray-500"} hover:font-bold transition-all duration-150`}
                            >
                                <FaUser className="w-6 h-6" />
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push('/technician/profile')}
                                className={`flex flex-col items-center justify-center ${pathname.includes('/profile') ? "text-blue-500 scale-105" : "text-gray-500"} hover:font-bold transition-all duration-150`}
                            >
                                <FaUser className="w-6 h-6" />
                            </button>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default BottomNav;