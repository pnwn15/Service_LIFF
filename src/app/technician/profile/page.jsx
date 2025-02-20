'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { ExclamationCircleFilled, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Modal, Input } from 'antd';  // Import Input from Ant Design
import axios from 'axios';
import BottomNav from '@/components/Bottom-Nav';
import { useRouter } from 'next/navigation';
import JobCard from '@/components/Job-Card';
import { getUser } from '@/lib/userManipulate';
import Loading from '@/components/LoadingPage';

const { confirm } = Modal;

function Profile() {

    const [data, setData] = useState([]);  // Data is initially empty
    const [user, setUser] = useState({});
    const [isDataVisible, setIsDataVisible] = useState(false); // To control visibility of data
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            confirm({
                title: 'Confirm Logout',
                icon: <ExclamationCircleFilled />,
                centered: true,
                danger: true,
                content: 'Are you sure you want to logout?',
                async onOk() {
                    await axios.get('/api/sign-out').then((result) => {
                        if (result.data.success) {
                            console.log('Sign out successful');
                            router.push('/login');
                        }
                    });
                    setUser(null);
                },
                onCancel() {
                    console.log('Cancel');
                },
            });
        } catch (error) {
            console.log(error);
        }
    }

    const fetchUser = async () => {
        try {
            const result = await getUser();
            setUser(result);
            return result; // Ensure fetchUser returns the user data
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    };

    const fetchData = async () => {
        try {
            const usr = await fetchUser();
            if (!usr) {
                console.error('No authorized user');
                return;
            }

            const role = usr.department;

            let url;

            // Determine URL based on user role
            if (role === "Administration" || role === "ผู้ดูแลระบบ") {
                url = `/api/maintenance/jobs?showall=true`;  // Admin can see all jobs
            } else {
                url = `/api/maintenance/jobs`;  // Other users see only their jobs
            }

            await axios.get(url)
                .then((result) => {
                    const filteredData = result.data.data.filter((job) => job.status === "Repaired");
                    setData(filteredData);
                  
                })
                .catch((err) => {
                    console.error('Error fetching jobs:', err);
                    setData([]);
                  
                });

        } catch (error) {
            console.error('Error fetching data:', error);
           
        }
    };

    // Toggle visibility of the data
    const handleSearch = () => {
        if (!isDataVisible) {
            fetchData(); // Fetch data when the user clicks search if the data is not visible
        }
        setIsDataVisible(!isDataVisible); // Toggle the visibility of the data
    };

    useEffect(() => {
        fetchUser(); // Fetch the user data when the component loads
    }, []);

    if (user) return (
        <Suspense fallback={<Loading />}>
            <div className=''>
                <BottomNav>
                    <div className="w-full h-screen bg-red-200 bg-gradient-to-b from-gray-50 to-red-500">
                        <div className='grid grid-cols-1 bg-yellow-300x'>
                            <div className='bg-slate-400x flex justify-start py-2'>
                                <Image src="/logo.png" className="self-start pl-3" width={122} height={10} alt="logo" />
                                <Button onClick={() => handleSignOut()}
                                    className="w-auto py-4 rounded-xl font-bold text-md fixed top-3 right-3" icon={<LogoutOutlined />} danger>Logout</Button>
                            </div>
                        </div>

                        <div className='mx-auto w-full bg-yellow-300x flex justify-center'>
                        </div>

                        <div className='bg-yellow-200x h-[15%] max-w-[400px] mx-auto grid grid-cols-3'>
                            <div className="flex justify-center items-center">
                                <div className="w-24 h-24 rounded-full border-2 border-red-500 overflow-hidden relative" >
                                    <Image alt="profile" src={`/api/image/person?id=${user.user_id}`} fill={true} style={{ objectFit: 'fill' }} />
                                </div>
                            </div>
                            <div className="col-span-2 bg-yellow-400x flex items-center" >
                                <div className="h-[75%] bg-blue-200x flex flex-col justify-evenly w-full">
                                    <div className='text-md truncate line-clamp font-semibold '>{user.name}</div>
                                    <div className=''>{user.department_id}</div>
                                    <div className=''> {user.phone}</div>
                                </div>
                            </div>
                        </div>

                        <div className='h-auto bg-pink-400x max-h-screen p-2'>
                            <div className="w-full bg-white/50 max-w-[400px] mx-auto h-full p-2 rounded-2xl">
                                <div className='flex gap-2 justify-start items-center py-4'>
                                    <HistoryOutlined />
                                    <div className='text-lg font-bold mb-1'>History</div>
                                    {/* Search Section */}

                                    <Button
                                        onClick={handleSearch} // Toggle search visibility and fetch data
                                        className="ml-2 bg-blue-500 text-white"
                                    >
                                        {isDataVisible ? 'Hide Data' : 'Show Data'} {/* Toggle button text */}
                                    </Button>
                                </div>

                                {/* Render jobs only after search */}
                                {isDataVisible && (
                                    <div className='bg-purple-200x h-[50vh] overflow-scroll w-full'>
                                      
                                        {data.length === 0 ? (
                                            <div className="text-center text-gray-500">No jobs found</div>
                                        ) : (
                                            data.map((job, index) => (
                                                <JobCard key={index} job={job} path={`/technician/task/${job.id}`} />
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </BottomNav>
            </div>
        </Suspense>
    )

    return <Loading />; // If user is not found, show loading or other message
}

export default Profile;
