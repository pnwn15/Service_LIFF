'use client'
import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Badge, Modal, Button } from 'antd';
import { FaArrowLeft } from "react-icons/fa6";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Loading from '@/components/LoadingPage';
import NotFoundPage from '@/components/NotFoundPage';
import { FormatDate } from '@/lib/DateFormatt';
import { EquipmentStatusCheck, EquipmentStatusTextCheck } from '@/lib/statusChecker';
import { stripHtmlTags } from '@/lib/stripHtml';

function Page({ params }) {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { taskID } = params;
    const [openModalID, setOpenModalID] = useState(null); // State for modal ID
    const [loadingModal, setLoadingModal] = useState(true);

    // Function to show the loading modal
    const showLoading = (id) => {
        setOpenModalID(id);
        setLoadingModal(true);
        setTimeout(() => {
            setLoadingModal(false);
        }, 2000);
    };

    // Fetch task data
    const fetchData = async (id) => {
        try {
            await axios.get(`/api/customer/job/${id}`)
                .then((res) => {
                    setData(res.data);
                    setLoading(false);
                })
                .catch((err) => {

                    setData([]);
                    setLoading(false);
                    console.log(err);
                });
        } catch (error) {
            setData([]);
            setLoading(false);
        }
    }

    useEffect(() => {
        try {
            let id = parseInt(taskID)
            if (id && id !== NaN) {
                fetchData(id);
            }
        } catch (err) {
            setData([]);
        }
    }, [taskID]);

    // If loading data, show the loading component
    if (loading) {
        return <Loading />;
    }

    if (taskID > 0) {
        return (
            <Suspense fallback={<Loading />}>
                <div>
                    <div className="w-full h-[100vh] bg-red-700 bg-gradient-to-b from-[#ff0000] via-red-100 to-[#ff0000]">
                        <div className='grid grid-cols-1 bg-yellow-300x md:hidden'>
                            <div className='bg-slate-400x flex justify-center py-2'>
                                <div className='service_logo text-white text-[24px] [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)]'> SERVICE</div>
                                <button>
                                    <FaArrowLeft onClick={() => router.back()} className="text-white text-3xl fixed top-4 left-3" />
                                </button>
                            </div>
                        </div>
                        <div className='h-[80%] bg-pink-400x max-h- p-2'>
                            <div className="w-full bg-white/50 h-[100%] overflow-scroll p-2 rounded-2xl custom-scrollbar mt-2">
                                <div className='bg-white h-full w-full rounded-lg p-3'>
                                    <div className='flex justify-between'>
                                        <div className='flex gap-1 w-auto text-center items-center'>
                                            <CalendarOutlined className='' />
                                            <div className='font-bold max-w-[175px] font10 line-clamp-2 text-left'>{data.name}</div>
                                        </div>
                                        <div className='flex flex-col justify-start items-end font-responsive'>
                                            <div className='flex justify-center items-center gap-1'>
                                                <Badge status={data.status == "New Request" ? 'warning' : data.status == "In Progress" ? 'processing' : 'success'} />
                                                <p className={`${data.status == "New Request" ? 'text-yellow-500' : data.status == "In Progress" ? 'text-blue-500' : 'text-green-500'}`}>{data.status || "unknown"}</p>
                                            </div>
                                            <div className="flex justify-center items-center gap-1">
                                                <ClockCircleOutlined />
                                                <p className='line-clamp-2'> {FormatDate(data.create_date) || "unknown"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 sm:w-full p-2">
                                        <div className=' flex gap-3 xl:w-[1200px]'>
                                            <div className='font-bold '>Detail</div>
                                            <p className="text-left line-clamp-3 whitespace-pre-line ">{stripHtmlTags(data.detail)}</p>
                                        </div>
                                        <h3 className="font-semibold text-lg">Equipment:</h3>
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-[20%] ">
                                            {data.equipments.map((equip, index) => (
                                                <div key={index} className="flex flex-col items-center p-2 rounded-lg shadow-lg border border-gray-200 bg-gray-50">
                                                    <div className="flex items-center justify-between w-full mb-2">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm sm:text-base md:text-lg lg:text-xl">
                                                                {index + 1}. {equip.name}
                                                            </span>
                                                            <span className="text-gray-500 text-xs sm:text-sm md:text-base">
                                                                <span className="font-semibold">S/N:</span> {equip.serial_no}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <Button type="primary" onClick={() => showLoading(equip.id)}>
                                                                Open Modal
                                                            </Button>

                                                            <Modal
                                                                title={<p>Equipment {equip.name} Details</p>}
                                                                footer={<Button type="primary" onClick={showLoading}>Reload</Button>}
                                                                loading={loadingModal}
                                                                open={openModalID === equip.id} // Show the modal only for the selected equipment
                                                                onCancel={() => showLoading(null)} // Close modal when clicked outside
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-sm sm:text-base md:text-lg lg:text-xl">
                                                                        {index + 1}. {equip.name}
                                                                    </span>
                                                                    <span className="text-gray-500 text-xs sm:text-sm md:text-base">
                                                                        <span className="font-semibold">S/N:</span> {equip.serial_no}
                                                                    </span>
                                                                    <div className={`flex gap-1 ${EquipmentStatusCheck(equip.status)} `}>
                                                                    <Badge status={EquipmentStatusCheck(equip.status)} />
                                                                    
                                                                        <p className={`text-xs sm:text-sm md:text-base ${EquipmentStatusTextCheck(equip.status)}`}>
                                                                            {equip.status === 'break_down'
                                                                                ? 'Break Down'
                                                                                : equip.status === 'complete'
                                                                                    ? 'Complete'
                                                                                    : equip.status === 'pending'
                                                                                        ? 'Pending'
                                                                                        : 'In Progress'}
                                                                        </p>
                                                                        </div>
                                                                    <p className="font-medium">Description: {equip.note || 'No description available.'}</p>
                                                                    <div className='flex flex-col justify-center items-center p-3 text-center'>
                                                                      
                                                                        {equip.image_after ? (
                                                                            <div>
                                                                                <div>ImageAfter</div>

                                                                                <Image width={200} height={100} alt="Equipment" src={`/api/image/equipment-report?id=${equip.id_report}`} />
                                                                            </div>

                                                                        ) : (
                                                                            <div>No image uploaded</div>
                                                                        )
                                                                        }
                                                                        {equip.image_before ? (
                                                                                <div>
                                                                                    <div>ImageBefore</div>
                                                                                <Image width={200} height={100} alt="Equipment" src={`/api/image/equipment-report2?id=${equip.id_report}`} />

                                                                                </div>
                                                                            ) : (
                                                                                <div>No image uploaded</div>
                                                                            )}
                                                                    
                                                                    </div>
                                                                </div>
                                                               
                                                            </Modal>

                                                            <div className={`flex gap-1 ${EquipmentStatusCheck(equip.status)} ml-auto`}>
                                                                <Badge status={EquipmentStatusCheck(equip.status)} />
                                                                <p className={`text-xs sm:text-sm md:text-base ${EquipmentStatusTextCheck(equip.status)}`}>
                                                                    {equip.status === 'break_down'
                                                                        ? 'Break Down'
                                                                        : equip.status === 'complete'
                                                                            ? 'Complete'
                                                                            : equip.status === 'pending'
                                                                                ? 'Pending'
                                                                                : 'In Progress'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="relative w-full h-auto mb-2 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 ">
                                                        <Image
                                                            alt="Equipment"
                                                            src={`/api/image/equipment?id=${equip.id}`}
                                                            fill
                                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                            style={{ objectFit: 'cover' }}
                                                            className="rounded-md"
                                                            priority
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Suspense>
        )
    } else {
        return (
            <NotFoundPage />
        )
    }
}

export default Page;
