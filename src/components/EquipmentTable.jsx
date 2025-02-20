import React, { useState } from 'react';
import { Button, Modal, notification } from 'antd';
import { FileSearchOutlined, EditOutlined } from '@ant-design/icons';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/userManipulate';
import axios from 'axios';
import { EquipmentStatusTextCheck } from '@/lib/statusChecker';


function EquipmentTable({ id, data }) {

    const router = useRouter()
    // const [Data, setData] = useState(data);

    // console.log(data)
    // console.log(id)


    const statusMapping = {
        0: "pending",
        1: "in_progress",
        2: "break_down",
        3: "complete"
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

            // Send the update request
            const res = await axios.patch(`/api/maintenance/report`, payload);
            if (res.status === 200) {
                notification.success({
                    message: 'Success',
                    description: 'Update successful',
                });
                // Uncomment if you want to navigate after successful update
                router.push(`/technician/task/${jobId}/equipment/${equipmentId}`);
            } else {
                console.error("Update Failed:", res.error);
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


    const handleShowDetails = async (jobID, eqID) => {
        // Open modal with equipment details
        try {
            const usr = await getUser();
            if (!usr) throw new Error('No authorized');

            // Check if the status is already in one of the final states
            router.push(`/technician/task/${jobID}/equipment/${eqID}/detail`);

        } catch (error) {
            console.error("Error submitting data:", error);
            notification.error({
                message: 'Submission Error',
                description: error.response?.data?.message || 'An error occurred.',
            });
        }

    }


    const Card = ({ data = {} }) => {


        return (
            <div className="p-2 w-full h-auto rounded-lg shadow-md border border-gray-200 bg-white">
                <div className="flex flex-row items-center">
                    {/* Image Container */}
                    <div className='relative w-28 h-24 overflow-hidden bg-gray-100 rounded-md'>
                        <Image
                            alt={data.name}
                            src={`/api/image/equipment?id=${data.id}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="rounded-md" />
                    </div>

                    {/* Equipment Details */}
                    <div className="w-full flex justify-between items-start ml-4">
                        <div className="flex flex-col space-y-1">
                            <div className="font-semibold text-lg">{data.name}</div>
                            <div className="text-sm font-medium text-gray-600">S/N: {data.serial_no}</div>
                            <div className="text-sm font-medium">
                                Status:
                                <span className={`ml-1 ${EquipmentStatusTextCheck(data.status)}`}>
                                    {data.status === "break_down" ? "Broken" : data.status === "complete" ? "Complete" : data.status === "pending" ? "Pending" : "In Progress"}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row gap-2 items-center">
                            <Button
                                icon={<FileSearchOutlined />}
                                onClick={() => handleShowDetails(id, data.id)}
                                className="border border-gray-300 hover:bg-gray-100"
                            />
                            {/* {Data.write && ( */}
                                <Button
                                onClick={() => confirmActivate(id, data.id, data.status, data.participants)}
                                    className="bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                                    type="primary"
                                    icon={<EditOutlined />}
                                />
                            {/* )} */}
                        </div>
                    </div>
                </div>
            </div>

        );
    };

    return (
        <>
            <div className='items-center mb-1 bg-white max-h-full md:h-full  min-h-full p-1 rounded-md'>
                <div className='font-bold w-auto my-2 ml-2'>Equipment</div>
                <div className='overflow-y-auto max-h-96 flex flex-col gap-2'> {/* Adjusted for scrolling */}
                    {(data.equipments).map((item, index) => (
                        <Card key={index} data={item} />
                    ))}
                </div>
            </div>
        </>
    );
}

export default EquipmentTable
