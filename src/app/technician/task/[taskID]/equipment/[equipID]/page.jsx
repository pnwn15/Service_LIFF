'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import {
    InfoCircleOutlined,
    LoadingOutlined,
    CameraOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { Badge, Select, Button, Input, notification, Modal, Steps } from 'antd';
import { FaArrowLeft } from "react-icons/fa6";
import BottomNav from '@/components/Bottom-Nav';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import NotFoundPage from '@/components/NotFoundPage';
import { getUser } from '@/lib/userManipulate';
import { EquipmentStatusCheck, EquipmentStatusTextCheck } from '@/lib/statusChecker';
import Loading from '@/components/LoadingPage';
const { Option } = Select;
const { TextArea } = Input;
function EquipmentUpdatePage({ params }) {

    const { equipID, taskID } = params;
    const router = useRouter();

    const [note, setNote] = useState('');
    const [status, setStatus] = useState(0)
    const [formData, setFormData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [imageDataBefore, setImageDataBefore] = useState([]);
    const [current, setCurrent] = useState(0);
    const [imageDataAfter, setImageDataAfter] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [imagePreviewAfter, setImagePreviewAfter] = useState([]);
    const [imagePreviewBefore, setImagePreviewBefore] = useState([]);
    const [videoDataAfter, setVideoDataAfter] = useState([]);
    const [videoDataPreviewAfter, setVideoDataPreviewAfter] = useState([]);
    const [videoDataBefore, setVideoDataBefore] = useState([]);
    const [videoDataPreviewBefore, setVideoDataPreviewBefore] = useState([]);
    // const [formData, setFormData] = useState({
    //     status: 0,
    //     note: ''
    // });

    const statusMapping = {
        0: "pending",
        1: "in_progress",
        2: "break_down",
        3: "complete"
    };
    const loadFormData = async () => {
        try {
            const usr = await getUser();
            if (!usr) throw new Error('No authorized');
            const response = await axios.get(`/api/maintenance/report?eid=${equipID}&jid=${taskID}`);
            setFormData(response.data);
            setNote(response.data.note || '');
            setStatus(response.data.template?.status?.data || 0);
            if (response.data.id) {
                const imageResponse = await axios.get(`/api/image/images-after?id=${response.data.id}`);
                if (imageResponse.data.report_images_after) {
                    setImagePreviewAfter(imageResponse.data.report_images_after)
                }
            }
            if (response.data.id) {
                const imageResponse = await axios.get(`/api/image/images-before?id=${response.data.id}`);
                if (imageResponse.data.report_images_before) {
                    setImagePreviewBefore(imageResponse.data.report_images_before);
                }
            }
            if (response.data.id) {
                const video_before = "video-before"
                const videoResponse = await axios.get(`/api/video/${video_before}?id=${response.data.id}`);
                if (videoResponse.data.report_video) {
                    setVideoDataPreviewBefore(videoResponse.data.report_video);
                }
            }

            if (response.data.id) {
                const video_after = "video-after"
                const videoResponse = await axios.get(`/api/video/${video_after}?id=${response.data.id}`);
                if (videoResponse.data.report_video) {
                    setVideoDataPreviewAfter(videoResponse.data.report_video);
                }
            }


        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImagesUploadAfter = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            const imageArray = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result.split(',')[1];
                        resolve({
                            name: file.name,
                            image: base64String
                        });
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imageArray).then(newImages => {
                setImageDataAfter(prevImages => {
                    const existingNames = new Set(prevImages.map(img => img.name)); // รายชื่อไฟล์ที่มีอยู่
                    const filteredImages = newImages.filter(img => !existingNames.has(img.name)); // กรองไฟล์ซ้ำออก
                    return [...prevImages, ...filteredImages];
                });
            });
        }
    };


    const handleConfirmBack = () => {
        Modal.confirm({
            title: 'Back  ',
            content: 'Are you sure you want to save the changes?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: () => { router.back(); },// Call the handleSubmit function if confirmed
        });
    };
    const handleConfirmSubmit = () => {
        Modal.confirm({
            title: 'Confirm Update',
            content: 'Are you sure you want to save the changes?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: () => {
                handleDone()
            }, // Call the handleSubmit function if confirmed
        });
    };

    const handleImagesUploadBefore = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            const imageArray = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result.split(',')[1];
                        resolve({
                            name: file.name,
                            image: base64String
                        });
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imageArray).then(newImages => {
                setImageDataBefore(prevImages => {
                    const existingNames = new Set(prevImages.map(img => img.name)); // รายชื่อไฟล์ที่มีอยู่
                    const filteredImages = newImages.filter(img => !existingNames.has(img.name)); // กรองไฟล์ซ้ำออก
                    return [...prevImages, ...filteredImages];
                });
            });
        }
    };


    const handleStatusChange = (value) => {
        setStatus(value);
    };

    const handleNoteChange = (e) => {
        setNote(e.target.value);
        // changeUpdate("note", e.target.value);  // Update session storage or state
    };


    // ฟังก์ชันจัดการการอัพโหลดวิดีโอ
    const handleVideoUploadAfter = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const videoData = {
                    video: reader.result.split(',')[1], // บันทึกเป็น Base64
                    video_url: URL.createObjectURL(file),
                    name: file.name,
                };
                setVideoDataAfter((prev) => [...prev, videoData]);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleVideoUploadBefore = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const videoData = {
                    video: reader.result.split(',')[1], // บันทึกเป็น Base64
                    video_url: URL.createObjectURL(file),
                    name: file.name,
                };
                setVideoDataBefore((prev) => [...prev, videoData]);
            };
            reader.readAsDataURL(file);
        }
    };

    // ฟังก์ชันลบวิดีโอ
    const handleRemoveVideoIndex = (index, setState) => {
        setState((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveImages = async (index, imageId, type, setState) => {
        setState((prevImages) => prevImages.filter((_, i) => i !== index));
        try {
            const usr = getUser();
            if (!usr) throw new Error('No authorized');

            await axios.post(`/api/image/${type}-delete`, {
                image_id: imageId,
                type: type,
            });

        } catch (err) {
            console.error("Error:", err);
        }
    };
    const handleRemoveVideo = async (index, videoId, type, setState) => {
        setState((prevVideo) => prevVideo.filter((_, i) => i !== index));
        try {
            await axios.post(`/api/video/${type}-delete`, {
                video_id: videoId,
                type: type
            });

        } catch (err) {
            console.error("Error:", err);
        }
    };
    const handleRemove = (index, type) => {
        if (type === 'image') {
            const updatedImageData = [...imageDataAfter];
            updatedImageData.splice(index, 1);
            setImageDataAfter(updatedImageData);
        } else if (type === 'video') {
            const updatedVideoData = [...videoDataAfter];
            updatedVideoData.splice(index, 1);
            setVideoDataAfter(updatedVideoData);
        }
    };

    const handleRemoveImageIndex = (index, setState) => {
        setState((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    useEffect(() => {
        loadFormData();
        // eslint-disable-next-line
    }, []);

    const dataStatus = formData?.template?.status?.selectable
        ? (status === 2 ? 'Break Down'
            : status === 3 ? 'Complete'
                : status === 0 ? 'Pending'
                    : 'In Progress')
        : null;
    const LastStatus = formData.last_status === 'break_down'
        ? 'Break Down'
        : formData.last_status === 'complete'
            ? 'Complete'
            : formData.last_status === 'pending'
                ? 'Pending'
                : 'In Progress';

    const steps = [
        {
            title: 'First',
            status: 'process',
            icon: <LoadingOutlined />,
            content: (
                <div className="flex flex-col justify-center items-center m-3">
                    <div className='flex gap-1'>
                        {/* ซ่อน input file */}
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImagesUploadAfter}
                            id="file-upload"
                            className="hidden"
                            required
                            multiple
                        />

                        {/* ปุ่มเลือกไฟล์ */}
                        <label
                            htmlFor="file-upload"
                            className="bg-blue-500 text-white px-4 py-2 flex  justify-center items-center gap-0.5 rounded-md cursor-pointer text-md transition duration-200 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 "
                        >
                            <CameraOutlined />
                            <span>Select Image</span>
                        </label>
                        {/* ซ่อน input file สำหรับวิดีโอ */}
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUploadAfter}
                            id="video-upload"
                            className="hidden"
                            required
                        />

                        {/* ปุ่มเลือกไฟล์สำหรับวิดีโอ */}
                        <label
                            htmlFor="video-upload"
                            className="bg-green-500 text-white px-4 py-2  flex  justify-center items-center gap-0.5 rounded-md cursor-pointer text-md transition duration-200 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            <CameraOutlined />
                            <span>Select Video</span>
                        </label>
                    </div>

                    {/* แสดงตัวอย่างภาพถ้ามีการอัพโหลด */}
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 mb-2">
                        {videoDataAfter.map((video, index) => (
                            <div key={index} className="relative cursor-pointer">
                                <video controls className="rounded-md w-[200px]">
                                    <source src={video.video_url || `data:video/mp4;base64,${video.video}`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                <button
                                    onClick={() => handleRemove(index, 'video')}
                                    className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        ))}
                        {imageDataAfter.map((image, index) => (
                            <div key={index} className="relative cursor-pointer">
                                <Image
                                    src={`data:image/jpeg;base64,${image.image}`}
                                    alt={image.name}
                                    width={200}
                                    height={100}
                                    sizes="(max-width: 600px) 100vw, 50vw"
                                    className="rounded-md"
                                />
                                <button
                                    onClick={() => handleRemove(index, 'image')}
                                    className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        ))}
                        
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 mb-2">
                        {videoDataPreviewAfter.map((video, index) => (
                            <div key={index} className="relative cursor-pointer">
                                <video controls className="rounded-md w-[200px]">
                                    <source src={video.video_url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                <button
                                    onClick={() => handleRemoveVideo(index, video.id, 'after', setVideoDataPreviewAfter)}

                                    className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        ))}
                        {imagePreviewAfter.map((image, index) => (
                            <div key={index} className="relative cursor-pointer">
                                <Image
                                    src={image.image_url}
                                    alt={image.name}
                                    width={200}
                                    height={100}
                                    sizes="(max-width: 600px) 100vw, 50vw"
                                    className="rounded-md"
                                />
                                <button
                                    onClick={() => handleRemoveImages(index, image.id, 'after', setImagePreviewAfter)}
                                    className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        ))}

                    </div>
                    {/* Error message */}
                    {errorMessage && (
                        <div className="mt-2 text-red-500 text-sm">
                            {errorMessage}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Second',
            content: (
                <div>
                    <div className='flex font12 gap-2 break-words'>
                        <div className='whitespace-nowrap leading-[2]'>Status:</div>
                        <Select
                            /* disabled={!formData.write} */
                            name="status"
                            defaultValue={dataStatus}
                            style={{
                                width: 120,
                            }}
                            onChange={handleStatusChange}  // Change here: Pass function reference, not call
                        >
                            {
                                formData?.template?.status?.selectable?.map((status, index) => (
                                    <Option key={index} value={index}>
                                        {status === 'break_down' ? 'Break Down' : status === 'complete' ? 'Complete' : status === "pending" ? 'Pending' : 'In Progress'}
                                    </Option>
                                ))
                            }
                        </Select>
                    </div>
                    <div className='flex flex-col font12 gap-2 break-words mt-3 leading-[2] mb-3'>
                        <div className='whitespace-nowrap'>Note:</div>
                        <TextArea name='note' /* disabled={!formData.write} */ rows={4} value={note} placeholder='กรุณากรอกข้อมูล'  /* defaultValue={"dd"} */ onChange={handleNoteChange} className='w-full  border border-gray-300 rounded-md p-1' />
                    </div>
                </div>),
        },
        {
            title: 'Last',
            content: (
                <div className="flex flex-col justify-center items-center m-3">
                    <div className='flex gap-1'>
                        {/* ซ่อน input file */}
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImagesUploadBefore}
                            id="file-upload"
                            className="hidden"
                            required
                            multiple
                        />

                        {/* ปุ่มเลือกไฟล์ */}
                        <label
                            htmlFor="file-upload"
                            className="bg-blue-500 text-white px-4 py-2  flex  justify-center items-center gap-0.5 rounded-md cursor-pointer text-md transition duration-200 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 "
                        >
                            <CameraOutlined />
                            <span>Select Image</span>
                        </label>

                        {/* ซ่อน input file สำหรับวิดีโอ */}
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUploadBefore}
                            id="video-upload"
                            className="hidden"
                            required
                        />

                        {/* ปุ่มเลือกไฟล์สำหรับวิดีโอ */}
                        <label
                            htmlFor="video-upload"
                            className="bg-green-500 text-white px-4 py-2  flex  justify-center items-center gap-0.5 rounded-md cursor-pointer text-md transition duration-200 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            <CameraOutlined />
                            <span>Select Video</span>
                        </label>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {videoDataBefore.map((video, index) => (
                            <div key={index} className="relative cursor-pointer">
                                <video controls className="rounded-md ">
                                    <source src={video.video_url || `data:video/mp4;base64,${video.video}`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                {/* ปุ่มลบวิดีโอ */}
                                <button
                                    onClick={() => handleRemoveVideoIndex(index, setVideoDataBefore)}
                                    className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        ))}
                        {
                            imageDataBefore.map((image, index) => (
                                <div key={index} className="relative">
                                    <Image
                                        src={image.image_url || `data:image/jpeg;base64,${image.image}`}
                                        alt={image.name}
                                        width={200}  // กำหนดขนาด width
                                        height={100} // กำหนดขนาด height
                                        sizes="(max-width: 600px) 100vw, 50vw" // การกำหนดขนาดของภาพสำหรับอุปกรณ์ที่แตกต่างกัน
                                        className="rounded-md"
                                    />
                                    <button
                                        onClick={() => handleRemoveImageIndex(index, setImageDataBefore)}
                                        className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                                    >
                                        <CloseOutlined />
                                    </button>
                                </div>
                            ))
                        }
                    </div>



                    <div className="mt-2 grid grid-cols-2 gap-2 mb-2">
                        {videoDataPreviewBefore.map((video, index) => (
                            <div key={index} className="relative cursor-pointer">
                                <video controls className="rounded-md ">
                                    <source src={video.video_url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                {/* ปุ่มลบวิดีโอ */}
                                <button
                                    onClick={() => handleRemoveVideo(index, video.id, "before", setVideoDataPreviewBefore)}
                                    className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        ))}


                        {
                            imagePreviewBefore.map((image, index) => (
                                <div key={index} className="relative cursor-pointer">
                                    <Image
                                        src={image.image_url}
                                        alt={image.name}
                                        width={200}
                                        height={100}
                                        sizes="(max-width: 600px) 100vw, 50vw"
                                        className="rounded-md"
                                    />
                                    {/* ปุ่มลบรูป */}
                                    <button
                                        onClick={() => handleRemoveImages(index, image.id, "before", setImagePreviewBefore)}
                                        className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                                    >
                                        <CloseOutlined />
                                    </button>

                                </div>
                            ))
                        }

                    </div>




                    {/* Error message */}
                    {errorMessage && (
                        <div className="mt-2 text-red-500 text-sm">
                            {errorMessage}
                        </div>
                    )}

                </div>
            ),
        },
    ];
    const next = () => {
        const currentData = { image: imageDataAfter, video: videoDataAfter, status: statusMapping[status], note: note, image_before: imageDataBefore }; // รวมรูปภาพ Base64 ลงใน formData
        if (!imageDataAfter) {
            setErrorMessage('Please choose your image.');
            return;
        }
        if (!imageDataAfter) {
            setErrorMessage('Please choose your image.');
            return;
        }
        setFormData({ ...formData, ...currentData });
        setCurrent(current + 1);
    };
    const prev = () => {
        setCurrent(current - 1);
        if (imageDataAfter) {
            setErrorMessage('');
            return;
        }
    };
    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!(file instanceof Blob)) {
                reject(new Error("Invalid file format"));
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]); // ตัด data:image/... ออก
            reader.onerror = (error) => reject(error);
        });
    };
    const resizeVideo = async (videoFile) => {
        const videoElement = document.createElement('video');
        const videoURL = URL.createObjectURL(videoFile);
        videoElement.src = videoURL;

        return new Promise((resolve, reject) => {
            videoElement.onloadeddata = async () => {
                // กำหนดขนาดใหม่
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 640;  // กำหนดขนาดใหม่ที่ต้องการ
                canvas.height = 360;

                // แสดงเฟรมแรกของวิดีโอใน canvas
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                // แปลงภาพจาก canvas เป็น Base64
                const compressedVideoBase64 = canvas.toDataURL('video/mp4');
                resolve(compressedVideoBase64);
            };

            videoElement.onerror = reject;
        });
    };

    const handleDone = async () => {
        try {
            const date = new Date();
            const formattedEndTime = date.toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:mm:ss'
            const usr = await getUser();
            if (!usr) throw new Error('No authorized');

            // ตรวจสอบและแปลงเฉพาะไฟล์ที่เป็น `File`
            const formattedImages = await Promise.all(
                imageDataAfter.map(async (img) => {
                    if (img instanceof File) {
                        const base64Image = await convertToBase64(img);
                        return { image: base64Image, name: img.name };
                    }
                    return { image: img.image, name: img.name }; // ถ้าเป็น Base64 อยู่แล้วก็ใช้เดิม
                })
            );
            const formattedImagesBefore = await Promise.all(
                imageDataBefore.map(async (img) => {
                    if (img instanceof File) {
                        const base64Image = await convertToBase64(img);
                        return { image: base64Image, name: img.name };
                    }
                    return { image: img.image, name: img.name };
                })
            );
            // ตรวจสอบและแปลงเฉพาะไฟล์ที่เป็น `File` สำหรับวิดีโอ
            const formattedVideosAfter = await Promise.all(
                videoDataAfter.map(async (video) => {
                    if (video instanceof File) {
                        const base64Video = await resizeVideo(video);
                        return { video: base64Video, name: video.name };
                    }
                    return { video: video.video, name: video.name }; // ถ้าเป็น Base64 อยู่แล้วก็ใช้เดิม
                })
            );
            const formattedVideosBefore = await Promise.all(
                videoDataBefore.map(async (video) => {
                    if (video instanceof File) {
                        const base64Video = await resizeVideo(video);
                        return { video: base64Video, name: video.name };
                    }
                    return { video: video.video, name: video.name }; // ถ้าเป็น Base64 อยู่แล้วก็ใช้เดิม
                })
            );
            const payload = {
                job_id: parseInt(taskID),
                equipment_id: parseInt(equipID),
                status: statusMapping[status], // Use the mapped string status
                note: note,
                image_after: formattedImages,
                image_before: formattedImagesBefore,
                video_after: formattedVideosAfter, // Add video data to payload
                video_before: formattedVideosBefore, // Add video data to payload
                end_date: formattedEndTime
            };

            const res = await axios.patch(`/api/maintenance/report`, payload);
            if (res.status === 200) {
                notification.success({
                    message: 'Success',
                    description: 'Update successful',
                });
                router.push(`/technician/task/${taskID}`);
            } else {
                notification.error({
                    message: 'Update Failed',
                    description: res.data.message || 'An error occurred while updating.',
                });
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            notification.error({
                message: 'Submission Error',
                description: error.response?.data?.message || 'An error occurred.',
            });
        }
    }


    if (isLoading) return (<Loading />)

    if (Object.keys(formData).length > 0) {
        return (
            <Suspense fallback={<Loading />}>
                <div className=''>
                    <BottomNav>
                        <div className="w-full  h-screen bg-red-200 bg-gradient-to-b from-gray-50 to-red-500">
                            <div className='grid grid-cols-1  bg-yellow-300x'>
                                <div className='bg-slate-400x flex justify-center py-2'>
                                    <Image src="/logo.png" className="self-center  " width={122} height={10} alt="logo" />
                                    <button >
                                        <InfoCircleOutlined className="text-gray-500 text-3xl fixed top-3 right-3" />
                                    </button>
                                    <button>
                                        <FaArrowLeft onClick={() => handleConfirmBack()} className="text-gray-500 text-3xl fixed top-4 left-3" />
                                    </button>
                                </div>
                                <div className='mx-auto w-full bg-yellow-300x flex justify-center'>

                                </div>
                            </div>
                            <div className='h-[80%] bg-pink-400x max-h- p-2'>
                                <div className=" w-full bg-white/50  h-[100%]  overflow-scroll p-2 rounded-2xl">
                                    <div className=' bg-purple-200x h-full w-full'>


                                        {/* <div className='flex justify-end bg-blue-300x px-1 pt-2'>

                                            <div className='flex flex-col justify-start items-end font10'>
                                                <div className='flex justify-center items-center gap-1 font10 font-bold'>
                                                    <Badge status={EquipmentStatusCheck(formData.last_status)} />
                                                    <p className={EquipmentStatusTextCheck(formData.last_status)}>{LastStatus}</p>
                                                </div>

                                            </div>
                                        </div> */}

                                        <div className="w-fill h-full my-3 p-2 flex flex-col">
                                            {/* <div className='flex self-end p-2'>
                                                    {
                                                        (formData.write) &&
                                                        <>
                                                            <Button onClick={() => handleConfirmSubmit()} type="primary">Save</Button>
                                                            <Button onClick={() => router.back()}>Cancel</Button>
                                                        </>
                                                    }
                                                </div> */}
                                            <div className='flex justify-between'>
                                                <div className='flex font12 gap-2 break-words leading-[2]'>
                                                    <div className='whitespace-nowrap'><span className='font-bold'>Name:</span></div>
                                                    <div>{formData.equipment_name}</div>
                                                </div>

                                                <div className='flex justify-start items-end font10'>
                                                    <div className='flex justify-center items-center gap-1 font10 font-bold'>
                                                        <Badge status={EquipmentStatusCheck(formData.last_status)} />
                                                        <p className={EquipmentStatusTextCheck(formData.last_status)}>{LastStatus}</p>
                                                    </div>

                                                </div>
                                            </div>
                                            <div className='flex font12 gap-2 break-words leading-[2]'>
                                                <div className='whitespace-nowrap'><span className='font-bold'>Serial Number:</span></div>
                                                <div>{formData.equipment_sr}</div>
                                            </div>

                                            <div>
                                                <div className="flex justify-end mt-4 ">
                                                    {current > 0 && (
                                                        <Button onClick={prev} className="mr-2">
                                                            Previous
                                                        </Button>
                                                    )}
                                                    {current < steps.length - 1 && (
                                                        <Button type="primary" onClick={next}>
                                                            Next
                                                        </Button>
                                                    )}
                                                    {current === steps.length - 1 && (
                                                        <Button type="primary" onClick={handleConfirmSubmit}>
                                                            Done
                                                        </Button>
                                                    )}

                                                </div>
                                                <Steps responsive={false} current={current} items={items} className="mt-4 mb-4" labelPlacement="vertical" />

                                                <div>{steps[current].content}</div>


                                            </div>


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
        <NotFoundPage />
    }
}


export default EquipmentUpdatePage