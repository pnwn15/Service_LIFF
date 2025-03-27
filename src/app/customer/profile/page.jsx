'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import {
    ExclamationCircleFilled,
    HistoryOutlined,
    LogoutOutlined,
    UserOutlined,
    RedditOutlined
} from '@ant-design/icons';
import { Button, Modal } from 'antd';
import axios from 'axios';
import C_JobCard from '@/components/c_Job-Card';
import { getUser } from '@/lib/userManipulate';
import Loading from '@/components/LoadingPage';
import { useRouter } from 'next/navigation'
import SlideText from '@/components/Side';

const { confirm } = Modal;

function ProfilePage() {
    const [data, setData] = useState([]);
    const [user, setUser] = useState({});
    const router = useRouter();
    const [showDetails, setShowDetails] = useState(false);

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };
    const handleSignOut = async () => {
        confirm({
            title: "Confirm Logout",
            icon: <ExclamationCircleFilled />,
            centered: true,
            danger: true,
            content: "Are you sure you want to logout?",
            async onOk() {
                try {
                    const result = await axios.get("/api/sign-out");
                    if (result.data.success) {
                        router.push("/login");
                    }
                } catch (error) {
                    console.error("Error during sign-out:", error);
                }
            },
        });
    };
 

    const fetchData = async () => {
        try {
            let url = `/api/customer/jobs`;
            const response = await axios.get(url);
            const currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() - 3);

            // Filter out jobs older than 3 months
            const filteredJobs = response.data.filter((job) => {
                const jobDate = new Date(job.create_date);  // Assuming job has 'created_at' field
            
                return jobDate >= currentDate && job.status === 'Repaired';
            });

            setData(filteredJobs);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };



    const fetchUser = async () => {
        try {
            const result = await getUser();
            setUser(result);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        fetchUser();
        fetchData();
    }, []);
        if (user) return (
            <Suspense fallback={<Loading />}>
                <div className="w-full  min-h-screen  bg-red-700 bg-gradient-to-b from-[#ff0000] via-red-100 to-[#ff0000]">
                    <SlideText />
                    {/* Header Section */}
                    <div className='py-4 px-6 flex justify-center items-center gap-4 w-full text-center'>
                        <div className='service_logo text-white text-[24px]'>
                            SERVICE
                        </div>
                        
                    </div>
                    


                    <div className="max-w-4xl mx-auto mt-1 p-6 flex flex-col items-center justify-center">
                        <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden relative mb-4 transform transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-3d hover:shadow-xl">
                            <Image alt="profile" src={`/api/image/person?id=${user.user_id}`} layout="fill" objectFit="cover" />
                        </div>

                        <div className="flex flex-col items-center border shadow-black border-b-2 border-t-2 border-l-2 border-r-2 border-gray-300 rounded-lg bg-white w-full p-6 shadow-md">
                            {/* ไอคอนคลิกได้ */}
                            <div className="flex items-center justify-between w-full mb-2">
                                <RedditOutlined className="text-2xl text-gray-600 cursor-pointer" onClick={toggleDetails} />
                                <span className="text-sm font-semibold text-gray-800">User Info</span>
                            </div>

                            {/* แสดงข้อมูลหรือซ่อนข้อมูล */}
                            {showDetails && (
                                <div className="w-full p-4 bg-white rounded-lg shadow-md">
                                    <div className="text-sm border-b-2 flex justify-between w-full font-semibold text-gray-800 mb-2">
                                        Name: <span>{user.name}</span>
                                    </div>
                                    <div className="text-sm flex border-b-2 justify-between w-full text-gray-600 mb-2">
                                        <span className="font-semibold text-gray-800">Phone:</span> {user.phone}
                                    </div>
                                
                                    {/* ปุ่ม Sign Out */}
                                    <div className="flex justify-center items-center mt-4">
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center justify-center text-lg border border-transparent rounded-full p-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold transform transition-all duration-300 ease-in-out hover:scale-105 hover:from-red-600 hover:to-red-800 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            <LogoutOutlined className="inline-block mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>

                            )}
                        </div>
                    </div>
                    {/* Job History Section */}
                    <div className="bg-white/70 rounded-xl shadow-lg max-w-4xl mx-auto p-6 mt-6">
                        <div className='flex gap-2 items-center text-xl font-semibold text-gray-800 mb-4'>
                            <HistoryOutlined className="text-red-600" />
                            <span>Job History</span>
                        </div>

                        {/* แสดงประวัติการทำงาน หรือข้อความแจ้งหากไม่มี */}
                        {data.length !== 0 ? (
                            <div className='h-[50vh] overflow-y-auto'>
                                {data.map((job, index) => (
                                    <C_JobCard key={index} task={job} path={`/customer/task/${job.id}`} />
                                ))}
                            </div>
                        ) : (
                            <div className='text-center text-gray-600 font-semibold'>
                                No jobs found in the last 3 months.
                            </div>
                        )}
                    </div>

                </div>
            </Suspense>
        );
}

export default ProfilePage;
