'use client'
import React, { useState, useLayoutEffect, Suspense } from 'react'
import {
    EyeOutlined,
    EyeInvisibleOutlined,
    UserOutlined,
    LockOutlined
} from '@ant-design/icons';
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Checkbox, message,Modal, Button } from 'antd';
import axios from 'axios';
import { getUser } from '@/lib/userManipulate';
import Loading from '@/components/LoadingPage';


function LoginPage() {

    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(true);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        // การทำงานเมื่อกด "Ok" (หากต้องการให้มีการดำเนินการต่อ)
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        // การทำงานเมื่อกด "Cancel" (หากต้องการให้ปิด Dialog)
        setIsModalVisible(false);
    };
    const checkLogin = async () => {
        try {
            const user = await getUser()
            // console.log('user', user)
            if (user && user.user_id) {
                router.push(`/${user.Internal ? "technician" : "customer"}/task`)
            } else {
                setIsLoading(false);
            }
        }
        catch (error) {
            console.log("error : ", error)
            setIsLoading(false);

        }
    }


    useLayoutEffect(() => {
        checkLogin()
    }, []);

    const popup = (type, msg) => {
        messageApi.open({ type: type, content: msg });
    }


    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    }

    const onChange = (e) => {
        console.log(`checked = ${e.target.checked}`);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleLogin = async (e) => {
        // console.log('login pressed ', formData);
        e.preventDefault();
        try {
            const response = await axios.post('/api/sign-in', { formData });

            // console.log("response", response);

            if (response.data.success) {
                popup('success', 'Login successful');
                // popup('success', `/${response.data.Internal ? "technician" : "customer"}/task`)
                router.push(`/${response.data.Internal ? "technician" : "customer"}/task`);
            } else {
                // ถ้าล็อกอินไม่สำเร็จ, ปิด Modal
                popup('error', response.data.error || 'Something went wrong');
                setIsModalVisible(false); // ปิด Modal เมื่อไม่สำเร็จ
            }

        } catch (err) {
            console.log(err);
            popup('error', 'Something went wrong');
            setIsModalVisible(false); // ปิด Modal เมื่อเกิดข้อผิดพลาด
        }
        // router.push('/task');
    }

    if(isLoading) return <Loading/>;
    return (
        <Suspense fallback={null}>
            <div className="w-full h-[100vh] min-h-screen bg-red-200 bg-gradient-to-b from-gray-50 to-red-500">
                {contextHolder}
                <div className="flex justify-center w-screen max-h-screen items-start   ">
                    <form
                        onSubmit={(e) => handleLogin(e)}
                        className="max-w-lg w-[90%] h-[50%] mx-auto bg-green-400x flex flex-col p-4">
                        {/*   <div className="text-[48px] self-center mt-10 font-semibold text-[#ff0909]   mb-5">Smartcom</div> */}
                        <Image src={`/logo.png`} className="self-center  mt-20 mb-10" width={250} height={100} alt="logo" />
                        <div className="mb-5">
                            {/*     <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label> */}
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-500">
                                    <UserOutlined />
                                </div>
                                <input type="text"
                                    id="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    name="username"
                                    className="bg-gray-100 shadow-gray-400 shadow-md   border-gray-200/50 text-gray-900 text-sm rounded-2xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-3  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Username" />
                            </div>
                        </div>
                        <div className="mb-5">
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-500">
                                    <LockOutlined />
                                </div>
                                <input
                                    type={isPasswordVisible ? 'text' : 'password'}

                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="bg-gray-50 shadow-md shadow-gray-400 border-gray-300 text-gray-900 text-sm rounded-2xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-3 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Password"

                                />
                                <div className="absolute inset-y-0 end-0 flex items-center pe-3">
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="text-gray-500 dark:text-gray-400"
                                    >
                                        {isPasswordVisible ? (
                                            <EyeInvisibleOutlined />
                                        ) : (
                                            <EyeOutlined />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start mb-5">
                            <div className="flex items-center h-5">
                                <Checkbox onChange={onChange}>Remember me 30 day</Checkbox>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="shadow-md hover:bg-red-500 text-white focus:ring-4 focus:outline-none focus:ring-white font-bold rounded-2xl text-lg w-full sm:w-auto px-5 py-2.5 text-center bg-black  dark:focus:ring-blue-800"
                            onClick={showModal} // เมื่อคลิกปุ่มนี้จะแสดง Modal
                        >
                            Login
                        </button>
                    </form>
                    {/* Modal dialog */}
                   

                </div>
            </div>
        </Suspense>
    )
}

export default LoginPage