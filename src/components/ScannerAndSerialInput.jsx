/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useContext, useState } from "react"
import LiffContext from "./LIFF/LiffContext";

import axios from "axios";
import Image from "next/image";
import { Button, Modal, message, notification } from "antd";
import {
    ScanOutlined,
    BarcodeOutlined
} from '@ant-design/icons';
import { getUser } from '@/lib/userManipulate';
import { useRouter } from "next/navigation";
import { EquipmentStatusTextCheck } from "@/lib/statusChecker";

export default function ScannerAndSerialInput() {
    const { LIFF } = useContext(LiffContext);
    const [input, setInput] = useState("");

    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Content of the modal');
    const [products, setProducts] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter()

    const popups = (type, msg) => {
        messageApi.open({
            key: msg,
            type: type,
            content: msg,
        });
    };

    const fetchUser = async () => {
        let result = {};
        try {
            result = await getUser();
        } catch (error) {
            console.log(error);
        }

        return result;
    }

    const showModal = () => {
        setOpen(true);
    };
    const statusMapping = {
        0: "pending",
        1: "in_progress",
        2: "break_down",
        3: "complete"
    };

    const handleOk = async () => {
        try {
            setConfirmLoading(true);
            const usr = await fetchUser();
            if (!usr) throw new Error('No authorized');
           
            // เรียก API เพื่อค้นหา jobs ตาม serial number
            const res = await axios.get(`/api/maintenance/jobs?&showall=true&sr=${input}`);
            if (res.data && res.data.data.length > 0) {
                const jobsData = res.data.data;

                // ดึงข้อมูล equipment ที่เกี่ยวข้องกับทุก job ตาม serial number
                const equipmentsData = await Promise.all(
                    jobsData.map(async (job) => {
                        const equipmentResponse = await axios.get(`/api/maintenance/job/${job.id}`);
                        return equipmentResponse.data; // ผลลัพธ์จาก API ที่จะรวมเข้ากับ job
                    })
                );

                const filteredEquipments = equipmentsData.flatMap(data => {
                    const matchedEquipments = data.equipments?.filter(equipment => equipment.serial_no === input) || [];

                    if (matchedEquipments.length > 0) {
                        // Return an object that includes both the job name and the matched equipments
                        return {
                            name: data.name, // ดึงชื่อของงานออกมา
                            equipments: matchedEquipments // ข้อมูลอุปกรณ์ที่ตรงกัน
                        };
                    }
                    return [];
                });

                // รวมข้อมูล jobsData และ filteredEquipments ตาม id งาน
                const combinedData = jobsData.map((job) => {
                    // หาข้อมูลอุปกรณ์ที่ตรงกันกับ job นี้ตาม id
                    const matchedEquipments = filteredEquipments.filter(equip =>
                        equip.name === job.name
                    );

                    return {
                        ...job, // ข้อมูลจาก job
                        equipments: matchedEquipments // เพิ่มข้อมูลอุปกรณ์ที่ตรงกัน
                    };
                });

                setProducts(combinedData);
                setEquipment(filteredEquipments);  // เก็บเฉพาะ equipment ที่ serial_no ตรงกัน
                popups('success', 'Success');
            } else {
                setProducts([]);
                setEquipment([]);
                popups('error', 'No jobs found');
            }
        } catch (err) {
            console.log(err);
            setProducts([]);
            setEquipment([]);
            popups('error', 'Request failed');
        } finally {
            setConfirmLoading(false);
        }
    };



    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };
    // Show confirmation modal before activating the task
    const confirmActivate = (jobId, equipmentId, currentStatus, particiPants) => {
        Modal.confirm({
            title: 'Are you sure you want to activate this task?',
            content: 'This action will update the task status and assign you as the participant.',
            onOk: () => {
                handleActivate(jobId, equipmentId, currentStatus, particiPants);
            },
            onCancel() {
                console.log('Activation cancelled');
            },
        });
    };
    const handleActivate = async (jobId, equipmentId, currentStatus, particiPants) => {
        try {
            const usr = await getUser();
            if (!usr) throw new Error('No authorized');
            const participantData = await axios.get('/api/data/user-src');

            let participantsList = participantData.data.data; // รายการผู้ใช้งานทั้งหมด

            // ตรวจสอบว่า particiPants มีค่า และไม่ตรงกับ usr.user_id
            if (particiPants && particiPants !== usr.user_id) {
                // ค้นหาผู้ใช้ที่มี id ตรงกับ particiPants
                let matchedUser = participantsList.find(ptp => ptp.id === particiPants);

                // แสดง notification พร้อมชื่อผู้ใช้ที่พบ
                notification.info({
                    message: 'Task In Progress',
                    description: matchedUser
                        ? `${matchedUser.name} is currently working on this task.`
                        : 'The team is currently working on this task.',
                });
                return;
            }
            if (["pending", "in_progress", "complete"].includes(currentStatus)) {
                router.push(`/technician/task/${jobId}/equipment/${equipmentId}`);
                return;
            }

            // Prepare the payload for updating the status and setting the participant
            const payload = {
                job_id: parseInt(jobId),
                equipment_id: parseInt(equipmentId),
                status: statusMapping[0], // Use the mapped string status
                participants: usr.user_id
            };

            const res = await axios.patch(`/api/maintenance/report`, payload);
            if (res.status === 200) {
                notification.success({
                    message: 'Success',
                    description: 'Update successful',
                });
                router.push(`/technician/task/${jobId}/equipment/${equipmentId}`);
            } else {
                console.error("Update Failed:", error);

                notification.error({
                    message: 'Update Failed',
                    description: res.data.message || 'An error occurred while updating.',
                });
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            notification.error({
                message: 'Submission Error',
                description: error.response?.data?.message || 'An error occurred.',
            });
        }
    }

    const LiffScanner = async () => {
        console.log('scanning');
        if (LIFF) {
            if (LIFF.isLoggedIn()) {
                try {
                    const result = await LIFF.scanCodeV2(); // QR scanner
                    if (result.value) {
                        const scannedSerial = result.value.toString();
                        setInput(scannedSerial); // Update input with scanned serial number

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
                                        job_id:parseInt(job.id),
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
                        }
                    }
                } catch (err) {
                    console.log(err);
                    popups('error', 'Scan failed');
                }
            }
        }
    };


    const ProdCard = ({ data }) => {

        const eQ = data.equipments[0].equipments[0]

        return (
            <div className="flex shadow-md bg-white rounded-xl mb-4 w-full border border-gray-200 p-4 focus:ring focus:ring-blue-300 transition ease-in-out duration-150 ">
                <div className="flex flex-col w-full ">
                    <div className="flex flex-col">
                        <div className="text-lg font-semibold ">
                            งาน: {data.name}
                        </div>
                        <div className="text-gray-500 text-end">Owner: {data.responsible}</div>
                    </div>

                    <div className='overflow-y-auto max-h-60 flex gap-2' >
                        <div className="flex p-1 w-full h-24 rounded-md shadow-md  items-center justify-center">
                            <div className='w-12 h-12 items-center justify-center'>
                                <Image width={12} height={12} alt={eQ.name} src={`/api/image/equipment?id=${eQ.id}`} layout="responsive" />
                            </div>
                            <div className='bg-pink-500x w-full flex justify-between'>
                                <div className='flex flex-col px-2'>
                                    <div className='font-bold'>{eQ.name}</div>
                                    <div className='font-bold'>S/N :{eQ.serial_no}</div>
                                    <div className='font-bold'>Status: <span className={EquipmentStatusTextCheck(eQ.status)}>
                                        {eQ.status === "break_down" ? "Broken" : eQ.status === "complete" ? "Complete" : eQ.status === "pending" ? "Pending" : "In Progress"}</span></div>
                                </div>
                                <div className='flex flex-row justify-end bg-red-700x gap-2 items-center'>
                                    <Button type="primary" className="w-16 font10 rounded-lg h-8 text-white" onClick={() => confirmActivate(data.id, eQ.id ,eQ.status,eQ.participants)}>
                                        activate
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    };


    return (
        <div className='bg-green-200x  flex flex-row gap-2 w-[80%] mt-5 justify-end'>
            {contextHolder}
            <button onClick={() => showModal()} type="submit" className=" flex justify-center gap-3 shadow-md text-black  focus:outline-none transition ease-in-out duration-150 focus:ring focus:ring-blue-300 font-bold rounded-full text-lg  px-5 py-2.5 text-center bg-white  ">
                <BarcodeOutlined className='text-2xl' />
                
            </button>
            <button
                onClick={() => LiffScanner()}

                type="submit" className="shadow-md  rounded-full max-w-16 w-16 text-black bg-white  focus:outline-none transition ease-in-out duration-150 focus:ring focus:ring-blue-300">
                <ScanOutlined className='text-3xl' />
            </button>
            <Modal
                title="Serial Number"
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                okText="Search"
                cancelText="Close"

            >
                <input type="text" placeholder="Serial Number e.g.SN184126466" className=" border border-gray-200 w-full mb-4 shadow-md rounded-2xl px-3 py-3 h-10 " value={input} onChange={(e) => setInput(e.target.value)} />
                {/*  <p>{modalText}</p>*/}
                {/* {products.length > 0 && (<p>{`"Found ${products.length} job for serial No.${input}"`}</p>)} */}
                {products.length > 0 && products.map((product, index) => (
                    <ProdCard key={index} data={product} />
                ))}

            </Modal>
        </div>
    )
}

