'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    InfoCircleOutlined,
    BookOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined 
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
    const [currentPage, setCurrentPage] = useState(1); // State for current page
    const [itemsPerPage, setItemsPerPage] = useState(5); // Number of items per page

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

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Go to next page
    const nextPage = () => {
        if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Go to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (user) {
        return (
            <BottomNav>
                <div className="w-full h-[100vh] relative bg-red-200 bg-gradient-to-b   from-gray-50 to-red-500">
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

                    <div className='h-[80%] bg-pink-400x  max-h- p-4'>
                        <div className="w-full bg-white/50  h-[100%] shadow-2xl border-black  overflow-scroll p-3 rounded-2xl">
                            

                            <div className='flex justify-between mx-7 flex-wrap'>
                                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                                    <BookOutlined className="text-primary text-xl" />
                                    Task
                                </h2>

                                <div className='flex gap-2'>
                                    <div className='flex justify-center items-center gap-2'>
                                        <input
                                            type="checkbox"
                                            checked={showPM}
                                            onChange={() => setShowPM(!showPM)}
                                            className="h-5 w-5"
                                        />
                                        <p className='font-bold text-left'>
                                            Show PM tasks only
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Display the number of remaining JobCards */}
                            <p className="text-lg text-center mt-2 font-bold bg-red-200 bg-gradient-to-b from-gray-50 to-red-500 rounded-full w-auto text-white">
                                {filteredData?.length} Job{filteredData?.length !== 1 ? 's' : ''} Remaining
                            </p>

                            {/* Display the filtered JobCards */}
                            {
                                currentItems?.map((job, index) => (
                                    <JobCard key={index} path={`/technician/task/${job.id}`} job={job} />
                                ))
                            }

                            {/* Pagination controls */}
                            <div className="flex justify-center items-end mt-4 gap-2">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 bg-blue-500 rounded-full text-white disabled:bg-red-600"
                                >
                                    <DoubleLeftOutlined className='w-6 h-6 flex justify-center items-center' />
                                </button>

                                {/* เปลี่ยนข้อความเป็นสี่เหลี่ยม และปรับขนาดให้เล็กลง */}
                                <div className="flex justify-center items-center w-8 h-8 bg-gray-300 text-gray-700 rounded-md border border-gray-500">
                                    {currentPage}
                                </div>

                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                                    className="px-2 py-1 bg-blue-500 rounded-full text-white disabled:bg-red-600"
                                >
                                    <DoubleRightOutlined className='w-6 h-6 flex justify-center items-center' />
                                </button>
                            </div>



                        </div>
                    </div>
                </div>
            </BottomNav>
        );
    }

    return null;  // If user is not loaded, return nothing.
}

export default TaskPage;