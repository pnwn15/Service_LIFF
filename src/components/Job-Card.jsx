import React from 'react'
import { CalendarOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
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
    <button onClick={handleActiveJob} className='focus:outline-none w-full focus:ring focus:ring-blue-300 transition ease-in-out duration-150 mb-4 rounded-xl overflow-hidden bg-white shadow-md '>
      <div className='min-h-24 h-auto p-1.5 '>
        <div className='flex justify-between bg-blue-300x px-1 '>
          <div className='flex gap-1 items-start w-auto'>
            <CalendarOutlined className='' />
            <div className='font-bold max-w-[175px] font10 line-clamp-2 text-left'>{job.name}</div>
          </div>
          <div className='flex flex-col justify-start items-end font-responsive'>
            <div className='flex justify-center items-center gap-1'>
              <Badge status={StatusCheck(job.status)} />
              <p className={StatusTextCheck(job.status)}>{job.status}</p>
            </div>
            <div className="flex justify-center items-center gap-1">
              <ClockCircleOutlined />
              <p className='line-clamp-2'> {FormatDate(job.create_date)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-between font-responsive bg-amber-400x w-full mt-4">
          <div className='flex justify-between items-start w-full gap-2 bg-slate-200x'>
            <div className="flex max-w-[100%] justify-between items-start">
              <MdLocationPin className='text-4xl w-12 h-auto text-red-500' />
              <p className='line-clamp-2 text-left'> {job.location}</p>
            </div>

            <div className="flex justify-center items-center gap-1">
              <UserOutlined />
              <p className='line-clamp-1 font-semibold '>{job.responsible}</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

export default JobCard;
