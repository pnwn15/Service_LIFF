import React from 'react'
import { SyncOutlined } from '@ant-design/icons'

function loading() {
  return (
    <div className='flex justify-center items-center h-screen w-screen'>
      
      <div className='flex flex-row font-bold justify-center items-center gap-2'>
        <SyncOutlined spin />
        <div className="">Loading...</div>
      </div>
    </div>

  )
}

export default loading;