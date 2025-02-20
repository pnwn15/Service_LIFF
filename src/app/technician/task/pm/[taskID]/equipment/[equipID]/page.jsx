'use client'
import React, { useState, useEffect } from 'react'

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/userManipulate';
import Loading from '@/components/LoadingPage';
import BottomNav from '@/components/Bottom-Nav';
import NotFoundPage from '@/components/NotFoundPage';
import Image from 'next/image'
import {
  InfoCircleOutlined,
  CloseOutlined,
  CameraOutlined

} from '@ant-design/icons';
import { Badge, Select, Button, Input, notification, Modal, Steps } from 'antd';
import { FaArrowLeft } from "react-icons/fa6";
import { EquipmentStatusCheck, EquipmentStatusTextCheck } from '@/lib/statusChecker';
import { stripHtmlTags } from '@/lib/stripHtml';
const { Option } = Select;
const { TextArea } = Input;

const EquipmentsPage = ({ params }) => {
  const { taskID, equipID } = params;


  const router = useRouter();

  const [note, setNote] = useState('');
  const [status, setStatus] = useState(0)
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isPreview, setIsPreview] = useState(false);
  const [imagesData, setImagesData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [imagesPreview, setImagesPreview] = useState([]);
  const [videosData, setVideosData] = useState([]);
  const [videosPreview, setVideosPreview] = useState([]);
  const [savedData, setSavedData] = useState(null);

  const loadFormData = async () => {
    try {
      const usr = await getUser();
      if (!usr) throw new Error('No authorized');
      const response = await axios.get(`/api/maintenance/report?eid=${equipID}&jid=${taskID}`);
      setFormData(response.data);
      setNote(response.data.note || '');
      setStatus(response.data.template?.status?.data || 0);
      if (response.data.id) {
        const imageResponse = await axios.get(`/api/image/imagesAll?id=${response.data.id}`);
        if (imageResponse.data.report_images) {
          setImagesPreview(imageResponse.data.report_images)
        }
      }
      if (response.data.id) {
        const videos = "videos"
        const videoResponse = await axios.get(`/api/video/${videos}?id=${response.data.id}`);
        if (videoResponse.data.report_video) {
          setVideosPreview(videoResponse.data.report_video);
        }
      }


    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const videoData = {
          video: reader.result.split(',')[1], // บันทึกเป็น Base64
          video_url: URL.createObjectURL(file),
          name: file.name,
        };
        setVideosData((prev) => [...prev, videoData]);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveVideoIndex = (index, setState) => {
    setState((prev) => prev.filter((_, i) => i !== index));
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
  const handleStatusChange = (value) => {
    setStatus(value);
  };
  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };
  const handleImagesUpload = (event) => {
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
        setImagesData(prevImages => {
          const existingNames = new Set(prevImages.map(img => img.name)); // รายชื่อไฟล์ที่มีอยู่
          const filteredImages = newImages.filter(img => !existingNames.has(img.name)); // กรองไฟล์ซ้ำออก
          return [...prevImages, ...filteredImages];
        });
      });
    }
  };
  const handleRemoveImages = async (index, imageId, type, setState) => {
    setState((prevImages) => prevImages.filter((_, i) => i !== index));
    try {
      const usr = getUser();
      if (!usr) throw new Error('No authorized');

      // ตรวจสอบค่าของ imageId และ type ก่อนส่ง
      console.log("Sending data:", { image_id: imageId, type });

      const response = await axios.post(`/api/image/${type}-delete`, {
        image_id: imageId,  // ส่ง image_id
        type: type,         // ส่ง type
      });

      console.log(response.data); // ตรวจสอบผลลัพธ์
    } catch (err) {
      console.error("Error:", err);
    }
  };
  const handleRemoveImageIndex = (index, setState) => {
    setState((prevImages) => prevImages.filter((_, i) => i !== index));
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
  const handleNext = () => {
    setSavedData({
      equipment_name: formData.equipment_name,
      equipment_sr: formData.equipment_sr,
      status: dataStatus,
      note: note,
      images: [...imagesData],
      videos: [ ...videosData]
    });
    setIsPreview(true);
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


      const formattedImages = await Promise.all(
        imagesData.map(async (img) => {
          if (img instanceof File) {
            const base64Image = await convertToBase64(img);
            return { image: base64Image, name: img.name };
          }
          return { image: img.image, name: img.name };
        })
      );
      const formattedVideos = await Promise.all(
        videosData.map(async (video) => {
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
        images: formattedImages,
        videos: formattedVideos,
        end_date: formattedEndTime
      };

      const res = await axios.patch(`/api/maintenance/report`, payload);
      if (res.status === 200) {
        notification.success({
          message: 'Success',
          description: 'Update successful',
        });
        router.push(`/technician/task/pm/${taskID}`);
      } else {
        notification.error({
          message: 'Update Failed',
          description: res.data.message || 'An error occurred while updating.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Submission Error',
        description: error.response?.data?.message || 'An error occurred.',
      });
    }
  }

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
  useEffect(() => {
    loadFormData();
    // eslint-disable-next-line
  }, []);
  const statusMapping = {
    0: "pending",
    1: "in_progress",
    2: "break_down",
    3: "complete"
  };
  if (isLoading) return (<Loading />)

  if (Object.keys(formData).length > 0) {
    return (
      <div className=''>
        <BottomNav>
          <div className="w-full h-screen bg-red-200 bg-gradient-to-b from-gray-50 to-red-500">
            <div className="grid grid-cols-1 bg-yellow-300x">
              <div className="bg-slate-400x flex justify-center py-2">
                <Image src="/logo.png" className="self-center" width={122} height={10} alt="logo" />
                <InfoCircleOutlined className="text-gray-500 text-3xl fixed top-3 right-3" />
                <FaArrowLeft onClick={() => handleConfirmBack()} className="text-gray-500 text-3xl fixed top-4 left-3" />
              </div>
            </div>

            <div className="h-[80%] bg-pink-400x max-h- p-2">
              <div className="w-full bg-white/50 h-[100%] overflow-scroll p-2 rounded-2xl">
                {!isPreview ? (
                  // --- โหมดกรอกข้อมูล ---
                  <>
                    <div className="flex  justify-end  items-center font10 gap-1">
                      <Badge status={EquipmentStatusCheck(formData.last_status)} />
                      <p className={EquipmentStatusTextCheck(formData.last_status)}>{LastStatus}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex font12 gap-2 break-words">
                        <div className="whitespace-nowrap leading-[2] font-bold">Status:</div>
                        <Select name="status" defaultValue={dataStatus} style={{ width: 120 }} onChange={handleStatusChange}>
                          {formData?.template?.status?.selectable?.map((status, index) => (
                            <Option key={index} value={index}>
                              {status === 'break_down' ? 'Break Down' : status === 'complete' ? 'Complete' : status === "pending" ? 'Pending' : 'In Progress'}
                            </Option>
                          ))}
                        </Select>
                      </div>
                      <div className="flex items-center">
                        <Button onClick={handleNext} className="bg-green-500 text-white px-6 py-3 rounded-lg text-md hover:bg-green-600">
                          Next
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col font12 gap-2 break-words mt-1 leading-[2] mb-3">
                      <div className="whitespace-nowrap font-bold">Note:</div>
                      <TextArea name="note" rows={6} value={note} placeholder="กรุณากรอกข้อมูล" onChange={handleNoteChange} className="w-full border border-gray-300 rounded-md p-1" />
                    </div>

                    <div className="flex flex-col justify-center items-center  m-3">
                      {/* ซ่อน input file */}
                      <div className='flex gap-1'>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImagesUpload}
                          id="file-upload"
                          multiple
                          className="hidden"
                          required
                        />

                        {/* ปุ่มเลือกไฟล์ */}
                        <label
                          htmlFor="file-upload"
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer text-md transition duration-200 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300  "
                        >
                          <div className='flex gap-1'>
                            <CameraOutlined />
                            <span>Select Image</span>
                          </div>

                        </label>
                        {/* ซ่อน input file สำหรับวิดีโอ */}
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
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
                          {videosData.map((video, index) => (
                            <div key={index} className="relative cursor-pointer">
                              <video controls className="rounded-md w-[200px]">
                                <source src={video.video_url || `data:video/mp4;base64,${video.video}`} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                              <button
                                onClick={() => handleRemoveVideoIndex(index, setVideosData)}
                                className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                              >
                                <CloseOutlined />
                              </button>
                            </div>
                          ))}
                          {
                            imagesData.map((image, index) => (
                              <div key={index} className="relative">
                                <Image
                                  src={`data:image/jpeg;base64,${image.image}`}
                                  alt={image.name}
                                  width={200}  // กำหนดขนาด width
                                  height={100} // กำหนดขนาด height
                                  className='rounded-lg'
                                />
                                <button
                                  onClick={() => handleRemoveImageIndex(index, setImagesData)}
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

                    {/* ปุ่มถัดไป */}

                  </>
                ) : (
                  // --- โหมดแสดงข้อมูล ---
                  <>

                    <div className="flex justify-end  gap-1">
                      <Button onClick={() => setIsPreview(false)} className=" text-black px-6 py-3 rounded-lg text-lg hover:bg-blue-600">
                        Back
                      </Button>
                      <Button onClick={handleConfirmSubmit} className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600">
                        Done
                      </Button>
                    </div>
                    <div className="mt-2">

                      <p><strong>Status:</strong> {savedData.status}</p>
                      <div className="flex font12 gap-2">
                        <div className="whitespace-nowrap">
                          <span className="font-bold">Note:</span>
                        </div>
                        <p dangerouslySetInnerHTML={{ __html: stripHtmlTags(savedData.note).replace(/\n/g, "<br>") }} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Upload Images:</h3>
                      {/* ปุ่มบันทึก */}

                        <div className="grid grid-cols-2 gap-2">
                          {savedData.videos.map((video, index) => (

                            <div key={index} className="relative cursor-pointer">
                              <video controls className="rounded-md w-[200px]">
                                <source src={video.video_url || `data:video/mp4;base64,${video.video}`} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                              <button
                                onClick={() => handleRemoveVideoIndex(index, setVideosData)}
                                className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                              >
                                <CloseOutlined />
                              </button>
                            </div>

                          ))}
                        {savedData.images.map((image, index) => (
                          <Image key={index} src={image.image_url || `data:image/jpeg;base64,${image.image}`} alt={image.name} width={200} height={100} className="rounded-md" />
                        ))}
                         
                      </div>
                    </div>


                  </>
                )} {
                  (imagesPreview.length > 0 || videosPreview.length > 0) && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {videosPreview.map((video, index) => (
                        <div key={index} className="relative cursor-pointer">
                          <video controls className="rounded-md w-[200px]">
                            <source src={video.video_url || `data:video/mp4;base64,${video.video}`} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          <button
                            onClick={() => handleRemoveVideo(index, video.id,"videos",setVideosPreview)}
                            className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                          >
                            <CloseOutlined />
                          </button>
                        </div>
                      ))}

                      {
                        imagesPreview.map((image, index) => (
                          <div key={index} className="relative">
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
                              onClick={() => handleRemoveImages(index, image.id, "images", setImagesPreview)}
                              className="absolute top-0 right-0 border border-red-600 text-red-600 rounded-full pl-1 pr-1 text-sm hover:bg-red-600 transition hover:text-white"
                            >
                              <CloseOutlined />
                            </button>

                          </div>
                        ))
                      }

                    </div>

                  )
                }
              </div>
            </div>
          </div>
        </BottomNav >
      </div>
    )
  } else {
    <NotFoundPage />
  }
}

export default EquipmentsPage
