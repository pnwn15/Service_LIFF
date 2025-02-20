'use'


import React from 'react'
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { MdLocationPin } from "react-icons/md";
import { Badge } from 'antd';
import { useRouter } from 'next/navigation';
import { FormatDate } from '@/lib/DateFormatt';
import { EquipmentStatusCheck, EquipmentStatusTextCheck } from '@/lib/statusChecker';
import { stripHtmlTags } from '@/lib/stripHtml';

function JobCard_C({ task, path }) {

  const router = useRouter();

  return (
    <button onClick={() => router.push(path)} className='focus:outline-none  w-full focus:ring focus:ring-blue-300 transition ease-in-out duration-150 mb-4 rounded-lg overflow-hidden bg-white shadow-md '>
      <div className='  min-h-24 h-auto p-1.5 '>
        <div className='flex justify-between bg-blue-300x px-1 '>
          <div className='flex gap-1 items-start w-auto  '>
            <CalendarOutlined className='' />
            <div className='font-bold  max-w-[175px] font10  line-clamp-2 text-left'>{task.name}</div>
          </div>
          <div className='flex flex-col justify-start items-end font-responsive'>
            <div className='flex justify-center items-center gap-1'>
              <Badge status={task.status == "New Request" ? 'warning' : task.status == "In Progress" ? 'processing' : 'success'} />
              <p className={`${task.status == "New Request" ? 'text-yellow-500' : task.status == "In Progress" ? 'text-blue-500' : 'text-green-500'}`}>{task.status|| "unknown"}</p>
            </div>
            <div className="flex justify-center items-center gap-1">
              <ClockCircleOutlined />
              <p className='line-clamp-2'> {FormatDate(task.create_date) || "unknown"}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col font-responsive bg-amber-400x mt-3">
          <div className=' flex gap-3 xl:w-[1200px]'>
            <div className='font-bold '>Detail</div>
            
            <p className="text-left  line-clamp-3 whitespace-pre-line ">{stripHtmlTags(task.detail)}</p>
          </div>

          <div className='text-left font-bold mt-3'>
            Equipments
          </div>
          <div className=' bg-white border  rounded-md shadow-md p-2 px-5 mt-2'>
            <table className='w-[100%] '>
              <thead>
                <tr className='text-left'>
                  <th>Name</th>
                  <th className='text-center'>Status</th>
                </tr>
              </thead>
              <tbody>
                {task.equipments.map((item, index) => (
                  <tr key={index}>
                    <td className='text-left text-ellipsis max-w-[150px]'>{item.name}</td>
                    <td className='text-right '>
                      <div className='flex gap-1 justify-center items-center'>
                        <Badge status={EquipmentStatusCheck(item.status)} />
                        <p className={EquipmentStatusTextCheck(item.status)}>{item.status === 'break_down'
                          ? 'Break Down'
                          : item.status === 'complete'
                            ? 'Complete'
                            : item.status === 'pending'
                              ? 'Pending'
                              : 'In Progress'}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </button>
  )
}

export default JobCard_C