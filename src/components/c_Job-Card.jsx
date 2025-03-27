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
    <button
      onClick={() => router.push(path)}
      className="focus:outline-none w-full focus:ring focus:ring-blue-300 transition ease-in-out duration-150 mb-4 rounded-lg overflow-hidden bg-cover bg-center bg-no-repeat shadow-lg border-gray-300 border-b-2 border-t-2 border-l-2 border-r-2"
      style={{ backgroundImage: 'url(/bg1.jpg)' }} // กำหนดภาพพื้นหลังที่นี่
    >
      <div className="min-h-24 h-auto p-4 bg-white/60 rounded-lg">
        {/* Content Section */}
        <div className="flex justify-between">
          <div className="flex gap-1 mt-2 items-start w-auto">
            <CalendarOutlined />
            <div className="font-bold max-w-[175px] font10 line-clamp-2 text-left">
              {task.name}
            </div>
          </div>
          <div className="flex flex-col justify-start items-end font-responsive">
            <div className="flex justify-center items-center gap-1">
              <Badge
                status={
                  task.status == "New Request"
                    ? "warning"
                    : task.status == "In Progress"
                      ? "processing"
                      : "success"
                }
              />
              <p
                className={`${task.status == "New Request"
                    ? "text-yellow-500"
                    : task.status == "In Progress"
                      ? "text-blue-500"
                      : "text-green-500"
                  }`}
              >
                {task.status || "unknown"}
              </p>
            </div>
            <div className="flex justify-center items-center gap-1">
              <ClockCircleOutlined />
              <p className="line-clamp-2">{FormatDate(task.create_date) || "unknown"}</p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col mx-2 font-responsive bg-amber-400x ">
          <div className="flex gap-3 xl:w-[1200px]">
            <div className="font-bold">Detail</div>
            <p className="text-left line-clamp-3 whitespace-pre-line">
              {stripHtmlTags(task.detail)}
            </p>
          </div>

          <div className="text-left font-bold mt-3">Equipments</div>
          <div className="bg-white border rounded-md shadow-md  px-6 mt-4">
            <table className="w-full text-sm table-auto">
              <thead className="border-b-2 border-gray-200">
                <tr className="text-left">
                  <th className="py-3 px-4 font-semibold text-gray-600">Name</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {task.equipments.map((item, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition-all duration-200`}
                  >
                    <td className="py-3 px-4 text-left text-ellipsis max-w-[200px]">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center items-center">
                        <Badge status={EquipmentStatusCheck(item.status)} />
                        <p className={EquipmentStatusTextCheck(item.status)}>
                          {item.status === "break_down"
                            ? "Break Down"
                            : item.status === "complete"
                              ? "Complete"
                              : item.status === "pending"
                                ? "Pending"
                                : "In Progress"}
                        </p>
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