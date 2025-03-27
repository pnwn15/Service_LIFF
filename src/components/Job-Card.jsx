import React from 'react'
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, WarningOutlined, HomeOutlined } from '@ant-design/icons';
import { MdLocationPin } from "react-icons/md";
import { Badge } from 'antd';
import { useRouter } from 'next/navigation';
import { FormatDate } from '@/lib/DateFormatt';
import { StatusCheck, StatusTextCheck } from '@/lib/statusChecker';

function JobCard({ job, path }) {
  const router = useRouter();

  const handleActiveJob = () => {
    // ตรวจสอบว่า job_description_s เป็น "PM" หรือไม่
    const newPath = job.job_description_s === "PM"
      ? `/technician/task/pm/${job.id}`  // ถ้าเป็น "PM"
      : `/technician/task/${job.id}`;  // ถ้าไม่ใช่ "PM"

    router.push(newPath);  // ไปยัง path ที่กำหนด
  }

  return (
    <button onClick={handleActiveJob} className='focus:outline-none  mt-4 relative w-full focus:ring focus:ring-blue-300 transition ease-in-out duration-150 mb-4 rounded-xl overflow-hidden bg-white border border-b-2 shadow-md '>
      <img className='absolute inset-0 w-full h-full object-cover' src="/bg1.jpg" alt="" />
      <div className='min-h-24 h-auto p-4 relative'>
        <div className='flex justify-between flex-wrap bg-blue-300x '>
          <div className='flex flex-col gap-1 items-start w-auto'>
            <div className='font-bold max-w-[175px]  font10 line-clamp-2 text-left'><p className='text-lg'> <WarningOutlined /> {job.name}</p></div>
            <p className='line-clamp-1 font-semibold text-sm '><UserOutlined /> : {job.responsible}</p>
          </div>
          <div className='flex flex-col justify-start items-end font-responsive'>
            <div className='flex justify-center  p-0.2 px-2   items-center gap-1'>
              <Badge status={StatusCheck(job.status)} />
              <p className={StatusTextCheck(job.status)}>{job.status}</p>
            </div>
            <div className="flex justify-center items-center gap-1">
              <ClockCircleOutlined />
              <p className='line-clamp-2'>{FormatDate(job.create_date)}</p>
            </div>
          </div>
        </div>

        <hr className="border-t-2 border-gray-800 border-dashed mt-6" />
        <div className="flex flex-row justify-between mt-4 font-responsive bg-amber-400x w-full">
          <div className='flex justify-between items-start w-full gap-2 bg-slate-200x'>
            <div className="flex max-w-[100%] gap-2 justify-between items-start">
              <p className='line-clamp-2  text-xs text-left flex-wrap'> <HomeOutlined /> {job.location}</p>
            </div>
          </div>
        </div>
      </div>
    </button>

  )
}

export default JobCard;
