'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    InfoCircleOutlined,
    BookOutlined
} from '@ant-design/icons';
import axios from 'axios';

import JobCard from '@/components/Job-Card';
import BottomNav from '@/components/Bottom-Nav';
import ScannerAndSerialInput from '@/components/ScannerAndSerialInput';
import { getUser } from '@/lib/userManipulate';

function TaskPage() {

    const [data, setData] = useState([]);
    const [user, setUser] = useState({});
    const [showPM, setShowPM] = useState(false);  // Track whether the "PM" checkbox is checked

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

    const fetchData = async () => {
        try {
            const usr = await fetchUser(); // Ensure this works before proceeding
            if (!usr) throw new Error('No authorized');

            const role = usr.department;
            let url;

            // Determine URL based on user role
            if (role === "Administration" || role === "ผู้ดูแลระบบ") {
                url = '/api/maintenance/jobs?showall=true';  // Admin can see all jobs
            } else {
                url = '/api/maintenance/jobs';  // Other users see only their jobs
            }

            // Perform the API call
            const response = await axios.get(url);

            // Filter jobs to exclude 'Repaired' jobs
            setData(response.data.data.filter((job) => job.status !== "Repaired"));
            // console.log(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        // Fetch data on initial load
        fetchData();

    }, []);  // Empty dependency array means this runs only once when the component mounts

    // Filter data based on the "PM" checkbox state
    const filteredData = showPM
        ? data.filter(job => job.job_description_s === "PM")
        : data.filter(job => job.job_description_s !== "PM");

    if (user) {
        return (
            <BottomNav>
                <div className="w-full h-[100vh] bg-red-200 bg-gradient-to-b from-gray-50 to-red-500">
                    <div className='grid grid-cols-1 bg-yellow-300x'>
                        <div className='bg-slate-400x flex justify-center py-2'>
                            <Image src="/logo.png" className="self-center" width={122} height={10} alt="logo" />
                            <button>
                                <InfoCircleOutlined className="text-gray-500 text-3xl fixed top-3 right-3" />
                            </button>
                        </div>
                        <div className='mx-auto w-full bg-yellow-300x flex justify-center'>
                            <ScannerAndSerialInput />
                        </div>
                    </div>

                    <div className='h-[80%] bg-pink-400x max-h- p-4'>
                        <div className="w-full bg-white/50 h-[100%] overflow-scroll p-3 rounded-2xl ">
                            <div>
                                <h2 className='text-start text-lg font-bold mb-2'> <BookOutlined /> Task</h2>
                                <div className='flex gap-2 ml-2'>
                                   
                                    <div className='flex justify-center items-center text-center gap-2 mb-2'>
                                        <input
                                            type="checkbox"
                                            checked={showPM}
                                            onChange={() => setShowPM(!showPM)}
                                        />
                                        <p className='font-bold '>
                                            Show PM tasks only
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {
                                filteredData?.map((job, index) => (
                                    <JobCard key={index} path={`/technician/task/${job.id}`} job={job} />
                                ))
                            }
                        </div>
                    </div>
                </div>
            </BottomNav>
        );
    }

    return null;  // If user is not loaded, return nothing.
}

export default TaskPage;
