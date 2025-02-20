'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import {
    ExclamationCircleFilled,
    HistoryOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { Button, Modal } from 'antd';
import axios from 'axios';
import C_JobCard from '@/components/c_Job-Card';
import { getUser } from '@/lib/userManipulate';
import Loading from '@/components/LoadingPage';

const { confirm } = Modal;

function ProfilePage() {
    const [data, setData] = useState([]);
    const [user, setUser] = useState({});

 

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
                <div className="w-full  h-screen  bg-red-700 bg-gradient-to-b from-[#ff0000] via-red-100 to-[#ff0000]">

                    {/* Header Section */}
                    <div className='py-4 px-6 flex justify-between items-center'>
                       
                    </div>

                    {/* Profile Section */}
                    <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto mt-8 p-6 flex flex-col md:flex-row items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-red-500 overflow-hidden relative mb-4 md:mb-0 md:mr-8">
                            <Image alt="profile" src={`/api/image/person?id=${user.user_id}`} layout="fill" objectFit="cover" />
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <div className="text-xl font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.department_id}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                    </div>

                    {/* Job History Section */}
                    <div className="bg-white/50 rounded-xl shadow-lg max-w-4xl mx-auto mt-8 p-6">
                        <div className='flex gap-2 items-center text-xl font-bold mb-4'>
                            <HistoryOutlined />
                            <span>Job History</span>
                        </div>
                        {data.length !== 0 ? (
                            <div className='h-[50vh] overflow-y-auto'>
                                {data.map((job, index) => (
                                    <C_JobCard key={index} task={job} path={`/customer/task/${job.id}`} />
                                ))}
                            </div>
                        ) : (

                            <div className='text-center'>No jobs found in the last 3 months.</div>
                        )}
                    </div>
                </div>
            </Suspense>
        );
}

export default ProfilePage;
