'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import {
    InfoCircleOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EditOutlined,
    FileSearchOutlined
} from '@ant-design/icons';
import { Badge, Button, Modal, notification } from 'antd';
import { FaArrowLeft } from "react-icons/fa6";
import axios from 'axios';
import BottomNav from '@/components/Bottom-Nav';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/userManipulate';
import Loading from '@/components/LoadingPage';
import NotFoundPage from '@/components/NotFoundPage';
import { StatusCheck, StatusTextCheck } from '@/lib/statusChecker';
import { FormatDate } from '@/lib/DateFormatt';
import { stripHtmlTags } from '@/lib/stripHtml';

function PmPage({ params }) {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});
    const [renderTrigger, SetRenderTrigger] = useState([])
    const [equipments, setEquipments] = useState([])
    const router = useRouter();

    const { taskID } = params;





    const fetchUser = async () => {
        let result = {};
        try {
            result = await getUser();
            setUser(result);

        } catch (error) {
            console.log(error);
        }

        return result;
    }


    const statusMapping = {
        0: "pending",
        1: "in_progress",
        2: "break_down",
        3: "complete"
    };

    const fetchData = async (id) => {
        try {
            const usr = await fetchUser()
            if (!usr) throw new Error('No authorized')
            await axios.get(`/api/maintenance/job/${id}`).then((res) => {

                setData(res.data);
                setEquipments(res.data.equipments)
                setLoading(false);
            })
                .catch((err) => {
                    setData([]);
                    setLoading(false);
                });
        } catch (error) {
            console.log(error);
        }
    }
    const handleActivate = async (jobId, equipmentId, currentStatus) => {
        try {
            const usr = await getUser();
            if (!usr) throw new Error('No authorized');



            if (["pending", "in_progress", "complete"].includes(currentStatus)) {
                router.push(`/technician/task/pm/${jobId}/equipment/${equipmentId}`);
                return;
            }

            // Prepare the payload for updating the status and setting the participant
            const payload = {
                job_id: parseInt(jobId),
                equipment_id: parseInt(equipmentId),
                status: statusMapping[0], // Use the mapped string status
            };

            // Send the update request
            const res = await axios.patch(`/api/maintenance/report`, payload);
            if (res.status === 200) {
                router.push(`/technician/task/pm/${jobId}/equipment/${equipmentId}`);
            } else {
                notification.error({
                    message: 'Update Failed',
                    description: res.data.message || 'An error occurred while updating.',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Submission Error',
                description: error.response?.data?.message || 'An error occurred.',
            });
        }
    };
    const confirmActivate = (jobId, equipmentId, currentStatus) => {
        Modal.confirm({
            title: 'Are you sure you want to edit this?',
            onOk: () => {
                handleActivate(jobId, equipmentId, currentStatus);
            },
            onCancel() {
                console.log('Activation cancelled');
            },
        });
    };

    const PmEquipmentID = equipments.map(item => item.id)
    const PmStatus = equipments.map(item => item.status)


    const handleShowDetails = async (jobID, eqID) => {
        // Open modal with equipment details
        try {
            const usr = await getUser();
            if (!usr) throw new Error('No authorized');

            // Check if the status is already in one of the final states
            router.push(`/technician/task/pm/${jobID}/equipment/${eqID}/detail`);

        } catch (error) {
            notification.error({
                message: 'Submission Error',
                description: error.response?.data?.message || 'An error occurred.',
            });
        }

    }

    useEffect(() => {
        try {
            let id = parseInt(taskID)

            if (id && id != NaN)
                fetchData(id);

        } catch (err) {
            console.log(err)
            setData([])
        }
    }, [renderTrigger]);

    if (loading) {
        return <Loading />;
    }
    if (taskID > 0) {
        return (
            <Suspense fallback={<Loading />}>
                <div className=''>
                    <BottomNav>
                        <div className="w-full  h-[100vh] bg-red-200 bg-gradient-to-b from-gray-50 to-red-500">
                            <div className='grid grid-cols-1  bg-yellow-300x'>
                                <div className='bg-slate-400x flex justify-center py-2'>
                                    <Image src="/logo.png" className="self-center  " width={122} height={10} alt="logo" />
                                    <button>
                                        <InfoCircleOutlined className="text-gray-500 text-3xl fixed top-3 right-3" />
                                    </button>
                                    <button>
                                        <FaArrowLeft onClick={() => router.back()} className="text-gray-500 text-3xl fixed top-4 left-3" />
                                    </button>
                                </div>
                                <div className='mx-auto w-full bg-yellow-300x flex justify-center'>

                                </div>
                            </div>
                            <div className='h-[80%] bg-pink-400x max-h- p-2'>
                                <div className=" w-full bg-white/50  h-[100%]  overflow-scroll p-2 rounded-2xl">
                                    <div className=' bg-purple-200x h-full w-full'>


                                        <div className='flex justify-between bg-blue-300x px-1 pt-4'>
                                            <div className='flex gap-1  items-start w-auto  '>
                                                <CalendarOutlined className='' />
                                                <div className='font-bold  max-w-[175px] font10  line-clamp-2 text-left'>{data.name}</div>
                                            </div>
                                            <div className='flex flex-col justify-start items-end font10'>
                                                <div className='flex justify-center items-center gap-1 font10 font-bold'>
                                                    <Badge status={StatusCheck(data.status)} />
                                                    <p className={StatusTextCheck(data.status)}>{data.status}</p>
                                                </div>
                                                <div className="flex justify-center items-center gap-1">
                                                    <ClockCircleOutlined />
                                                    <p className='line-clamp-2 font10'> {FormatDate(data.create_date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex flex-col w-full px-1 font10 bg-pink-200x mt-3'>
                                            <div className='flex flex-row gap-1'>
                                                <div className='font-bold  w-auto '> Detail:</div>
                                                <div className="text-left line-clamp-3 whitespace-pre-line "><p dangerouslySetInnerHTML={{ __html: stripHtmlTags(data.detail).replace(/\n/g, "<br>") }} /></div>
                                            </div>
                                        </div>
                                        <div className='flex flex-col w-full px-1 font10 bg-blue-200x mt-3'>
                                            <div className='flex flex-row gap-1'>
                                                <div className='font-bold  w-auto '> Address:</div>
                                                <div className="bg-yellow-200x">{data.location}</div>
                                            </div>
                                        </div>
                                        <div className='flex justify-between px-1 mt-2 items-center'>
                                            <h1 className='font-semibold text-sm'>
                                                Equipments
                                            </h1>
                                            <div className='flex gap-1'>
                                                <Button
                                                    icon={<FileSearchOutlined />}
                                                    onClick={() => handleShowDetails(taskID, PmEquipmentID[0])}
                                                    className="border border-gray-300 hover:bg-gray-100"
                                                />
                                                <Button
                                                    onClick={() => confirmActivate(taskID, PmEquipmentID[0], PmStatus[0])}
                                                    className="bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                                                    type="primary"
                                                    icon={<EditOutlined />}
                                                />
                                                
                                            </div>

                                        </div>
                                        <div className='w-full px-1 font10 grid grid-cols-2 gap-2 mt-3'>
                                            {
                                                equipments.map((item, index) => (
                                                    <div className="p-2 w-full h-auto rounded-lg shadow-md border border-gray-200 bg-white " key={index}>

                                                        <div className="items-center justify-center ">
                                                            <div className="font-semibold text-sm">{item.name}</div>
                                                            <div className="text-sm font-medium text-gray-600">S/N: {item.serial_no}</div>
                                                        </div>

                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </BottomNav >
                </div>
            </Suspense>
        )
    } else {
        return (
            <NotFoundPage />
        )
    }
}


export default PmPage