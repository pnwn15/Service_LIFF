'use client'
import { FaUser } from "react-icons/fa";
import { RiQrScan2Line } from "react-icons/ri";
import { IoHome } from "react-icons/io5";
import { CgMathPlus } from "react-icons/cg";
import { ExclamationCircleFilled, LogoutOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/userManipulate';
import { useRouter, usePathname } from 'next/navigation';
import axios from "axios";

const { confirm } = Modal;

const C_BottomNav = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);

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
    };

    const fetchUser = async () => {
        try {
            const result = await getUser();
            setUser(result);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div className="relative min-h-screen">
            {/* Desktop Navigation Bar */}
            <div className="hidden md:flex bg-white shadow-md border border-gray-200 px-4 py-2 justify-between items-center">
                <div className='service_logo text-black text-[24px] '>SERVICE</div>
                <div className='flex justify-center text-center gap-5'>
                    {/* Home */}
                    <button
                        onClick={() => router.push('/customer/task')}
                        className={`flex items-center ${pathname.includes('/customer/task') && !pathname.includes('/create') ? "text-red-500" : "text-gray-500"} hover:font-bold transition-all duration-150`}>
                        <IoHome className="w-6 h-6" />
                        <span className="ml-2">Home</span>
                    </button>

                    {/* Create Button */}
                    <button
                        onClick={() => router.push('/customer/task/create')}
                        className={`flex items-center ${pathname.includes('/customer/task/create') ? "text-white bg-red-500" : "text-gray-500 bg-white border-red-500"} hover:font-bold transition-all duration-150 rounded-full p-2 shadow-lg border-[8px]`}>
                        <CgMathPlus className={`w-[24px] h-[24px] ${pathname.includes('/customer/task/create') ? "text-white" : "text-gray-500"}`} />
                        <span className="ml-2">Create</span>
                    </button>

                    {/* Profile Button */}
                    <button
                        onClick={() => router.push('/customer/profile')}
                        className={`flex items-center ${pathname.includes('/profile') ? "text-red-500" : "text-gray-500"} hover:font-bold transition-all duration-150`}>
                        <FaUser className="w-6 h-6" />
                        <span className="ml-2">Profile</span>
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={() => handleSignOut()}
                        className={`text-gray-500 hover:font-bold hover:text-red-500 transition-all duration-150 flex items-center`}>
                        <LogoutOutlined className="w-6 h-6" />
                        <span className="ml-2">Logout</span>
                    </button>
                </div>
            </div>  

            {children}

            {/* Footer */}
            <footer className="bg-white/70 text-black py-4 ">
                <div className="text-center text-sm mt-4 font-bold">
                    &copy; 2024 Service, SmartCom.
                </div>
            </footer>

            {/* Mobile Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white mb-2 mx-2 rounded-full shadow-md border border-gray-200 md:hidden">
                <div className="flex justify-around items-center h-16">
                    {/* Home */}
                    <button
                        onClick={() => router.push('/customer/task')}
                        className={`flex flex-col items-center justify-center ${pathname.includes('/customer/task') && !pathname.includes('/create') ? "text-red-500 scale-105" : "text-gray-500"} hover:font-bold transition-all duration-150`}>
                        <IoHome className="w-6 h-6" />
                    </button>

                    {/* Create */}
                    <button
                        onClick={() => router.push('/customer/task/create')}
                        className={`flex flex-col items-center justify-center ${pathname.includes('/customer/task/create') ? "text-red-500 bg-red-500 scale-105 border-white" : "text-gray-500 bg-white border-red-500"} hover:font-bold transition-all duration-150 rounded-full p-2 shadow-lg border-[8px]`}>
                        <CgMathPlus className={`w-[24px] h-[24px] ${pathname.includes('/customer/task/create') ? "text-white" : "text-gray-500"}`} />
                    </button>

                    {/* Profile */}
                    <button
                        onClick={() => router.push('/customer/profile')}
                        className={`flex flex-col items-center justify-center ${pathname.includes('/profile') ? "text-red-500 scale-105" : "text-gray-500"} hover:font-bold transition-all duration-150`}>
                        <FaUser className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default C_BottomNav;
