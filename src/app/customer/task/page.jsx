'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    FileDoneOutlined,
    InfoCircleOutlined,
    BarcodeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { getUser } from '@/lib/userManipulate';
import JobCard_C from '@/components/c_Job-Card';
import SlideText from '@/components/Side';
import { Divider, Modal } from 'antd';

function TaskPage() {

    const [data, setData] = useState([]);

    const fetchUser = async () => {
        //fetch the user for database
        let result = {};
        try {
            result = await getUser();
        } catch (error) {
            console.log(error);
        }

        return result;
    }
    const fetchData = async () => {
        // fetch the data 
        try {
            const usr = await fetchUser();
            if (!usr) throw new Error('No authorized');

            let url = `/api/customer/jobs`;
            const response = await axios.get(url);
            setData(response.data.filter((job) => {
                return job.status !== "Repaired";
            }));

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // เมื่อเข้าหน้านี้ จะทำให้ modal แสดง
        setIsModalVisible(true);
    }, []); // Empty array เพื่อให้ทำงานเพียงครั้งเดียวเมื่อเพจโหลดเสร็จ

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const [isModalVisible, setIsModalVisible] = useState(false);
    return (
     
        <div className="w-full  h-[100vh] [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)] bg-red-700 bg-gradient-to-b from-[#ff0000] via-red-100 to-[#ff0000]">
                <div className='grid grid-cols-1  bg-yellow-300x'>
                <div className=' md:hidden bg-slate-400x flex justify-center py-2'>
                    <div className='service_logo text-white text-[24px] '> SERVICE</div>
                        <button>
                            <InfoCircleOutlined className="text-gray-500 text-3xl fixed top-3 right-3" />
                        </button>
                    </div>
            </div>
            <SlideText />
                <div className='h-[85%] bg-pink-400x max-h- p-4'>
               
                <div className=" w-full bg-white/50 shadow-white shadow-2xl  h-[100%] p-3 rounded-lg">
                    <Divider>
                    <div className='mb-2 font-bold font12 flex gap-1 items-center'>
                        <FileDoneOutlined className='text-xl' />
                        <div className=" px-2"> {/* เส้นขีดแนวนอน */}
                            Request
                        </div>
                        </div>
                    </Divider>

                    <div className='overflow-scroll h-[95%] mt-3 custom-scrollbar'>
                            {
                                data.map((task, index) => (
                                    <JobCard_C key={index} path={`/customer/task/${task.id}`} task={task} />
                                ))
                            }
                        </div>
                    </div>
            </div>
            {/* Modal */}
            <Modal
                title="Welcome To Service"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Got it"
                
            >
                <p>Welcome to the page! You can add your message here.</p>
            </Modal>
            </div>
     
    )
}

export default TaskPage